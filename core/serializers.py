# # core/serializers.py (FINALIZED CODE)

# from rest_framework import serializers
# from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer, UserSerializer as DjoserUserSerializer
# from .models import User, Ride, Booking # Import all models
# from django.contrib.gis.geos import Point # Keep this, even if PostGIS implementation is deferred

# # -------------------------------------------------------------------
# # 1. USER SERIALIZERS (Djoser Overrides)
# # -------------------------------------------------------------------

# class UserCreateSerializer(DjoserUserCreateSerializer):
#     class Meta(DjoserUserCreateSerializer.Meta):
#         model = User
#         fields = ('id', 'username', 'password', 'email', 'phone_number')

# class UserSerializer(DjoserUserSerializer):
#     class Meta(DjoserUserSerializer.Meta):
#         model = User
#         fields = ('id', 'username', 'email', 'phone_number', 'is_driver')
#         read_only_fields = ('id', 'email')

# # Serializer to expose basic passenger info to the driver
# class PassengerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'phone_number')

# # -------------------------------------------------------------------
# # 2. RIDE SERIALIZER
# # -------------------------------------------------------------------

# class RideSerializer(serializers.ModelSerializer):
#     driver_username = serializers.CharField(source='driver.username', read_only=True)
    
#     class Meta:
#         model = Ride
#         fields = (
#             'id', 'driver', 'driver_username', 'pickup_address', 
#             'destination_address', 'start_time', 'seats_available',
#             'price_per_seat', 'route_polyline', 'is_active',
            
#             # Keep Lat/Lng fields for input/output for now
#             'pickup_latitude', 'pickup_longitude',
#             'destination_latitude', 'destination_longitude',
#         )
#         read_only_fields = ('id', 'driver', 'is_active', 'route_polyline')

# # -------------------------------------------------------------------
# # 3. BOOKING SERIALIZER (CRITICAL FIXES APPLIED)
# # -------------------------------------------------------------------

# class BookingSerializer(serializers.ModelSerializer):
#     # CRITICAL FIX 1: This handles the input (POST) - expects a ride ID
#     # This automatically converts the ID to the Ride object internally
#     ride = serializers.PrimaryKeyRelatedField(
#         queryset=Ride.objects.all(), 
#         write_only=True # Only used when creating the booking
#     )
    
#     # Read-only fields for output/display:
#     passenger = PassengerSerializer(read_only=True) # Displays full passenger object for the driver
#     ride_info = serializers.CharField(source='ride.__str__', read_only=True) # Ride summary for display
#     class Meta:
#         model = Booking
#         fields = ('id', 'ride', 'passenger', 'seats_booked', 'status', 'booked_at', 'ride_info')
#         # IMPORTANT: 'passenger' is NOT in read_only_fields because we set it in create()
#         read_only_fields = ('status', 'booked_at') 
    
#     # CRITICAL FIX 2: Override create method to set passenger and validate seats
#     def create(self, validated_data):
#         # 1. Get the current logged-in user (THE PASSENGER) from the request context
#         user = self.context['request'].user 
#         validated_data['passenger'] = user 

#         ride = validated_data['ride']
#         seats_booked = validated_data['seats_booked']
        
#         # Prevent user from booking their own ride 
#         if ride.driver == user:
#             raise serializers.ValidationError({"non_field_errors": ["You cannot book seats on your own published ride."]})
        
#         # Seat check
#         if ride.seats_available < seats_booked:
#             # Return specific error key for frontend to handle:
#             raise serializers.ValidationError({"seats_booked": [f"Only {ride.seats_available} seats available on this ride."]})
            
#         # Hold the seats (decrement inventory)
#         ride.seats_available -= seats_booked
#         ride.save()
        
#         # Create the Booking object
#         return super().create(validated_data)


from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer, UserSerializer as DjoserUserSerializer
from .models import User, Ride, Booking
from django.contrib.gis.geos import Point

# -------------------------------------------------------------------
# 1. USER SERIALIZERS
# -------------------------------------------------------------------

class UserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'password', 'email', 'phone_number')

class UserSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'is_driver')
        read_only_fields = ('id', 'email')

# Serializer to expose basic passenger info to the driver
class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number')

# NEW SERIALIZER: Expose basic driver info to the passenger (when booking is ACCEPTED)
class DriverContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number') # Expose basic contact info

# -------------------------------------------------------------------
# 2. RIDE SERIALIZER
# -------------------------------------------------------------------

class RideSerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    
    class Meta:
        model = Ride
        fields = (
            'id', 'driver', 'driver_username', 'pickup_address', 
            'destination_address', 'start_time', 'seats_available',
            'price_per_seat', 'route_polyline', 'is_active',
            
            # Keep Lat/Lng fields for input/output for now
            'pickup_latitude', 'pickup_longitude',
            'destination_latitude', 'destination_longitude',
        )
        read_only_fields = ('id', 'driver', 'is_active', 'route_polyline')

# -------------------------------------------------------------------
# 3. BOOKING SERIALIZER (MODIFIED FOR CHAT & DRIVER CONTACT)
# -------------------------------------------------------------------

class BookingSerializer(serializers.ModelSerializer):
    # POST: write ride_id only
    ride_id = serializers.PrimaryKeyRelatedField(
        queryset=Ride.objects.all(),
        write_only=True,
        source='ride'
    )

    # GET: full ride object for frontend
    ride = RideSerializer(read_only=True)

    passenger = PassengerSerializer(read_only=True)
    driver_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = (
            'id', 'ride_id', 'ride',
            'passenger', 'seats_booked',
            'status', 'booked_at',
            'driver_contact'
        )
        read_only_fields = ('status', 'booked_at', 'ride', 'driver_contact')

    def get_driver_contact(self, obj):
        if obj.status == 'ACCEPTED':
            driver = obj.ride.driver
            return DriverContactSerializer(driver).data
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['passenger'] = user
        ride = validated_data['ride']
        seats_booked = validated_data['seats_booked']

        if ride.driver == user:
            raise serializers.ValidationError({"non_field_errors": ["You cannot book your own ride."]})

        if ride.seats_available < seats_booked:
            raise serializers.ValidationError({"seats_booked": [f"Only {ride.seats_available} seats available."]})

        ride.seats_available -= seats_booked
        ride.save()

        return super().create(validated_data)

# core/serializers.py

# class BookingSerializer(serializers.ModelSerializer):
#     # Used when creating a booking (POST)
#     ride_id = serializers.PrimaryKeyRelatedField(
#         source='ride',
#         queryset=Ride.objects.all(),
#         write_only=True
#     )

#     # Used when reading a booking (GET)
#     ride = RideSerializer(read_only=True)

#     passenger = PassengerSerializer(read_only=True)
#     driver_contact = serializers.SerializerMethodField()

#     class Meta:
#         model = Booking
#         fields = (
#             'id', 'ride_id', 'ride', 'passenger', 'seats_booked',
#             'status', 'booked_at', 'driver_contact'
#         )
#         read_only_fields = ('status', 'booked_at', 'ride', 'driver_contact')

#     def get_driver_contact(self, obj):
#         if obj.status == 'ACCEPTED':
#             driver = obj.ride.driver
#             return DriverContactSerializer(driver).data
#         return None

#     def create(self, validated_data):
#         user = self.context['request'].user
#         validated_data['passenger'] = user
#         ride = validated_data['ride']
#         seats_booked = validated_data['seats_booked']

#         if ride.driver == user:
#             raise serializers.ValidationError({"non_field_errors": ["You cannot book your own ride."]})
#         if ride.seats_available < seats_booked:
#             raise serializers.ValidationError({"seats_booked": [f"Only {ride.seats_available} seats available."]})

#         ride.seats_available -= seats_booked
#         ride.save()
#         return super().create(validated_data)
