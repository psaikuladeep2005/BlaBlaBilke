# core/views.py (FINAL STRUCTURE - READY)

from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F # Keep if needed for math/distance
from django.db.models.functions import Sin, Cos, Radians
from .models import Ride, Booking  
from .serializers import RideSerializer, BookingSerializer 
# ADDITION: Ensure this import is available if you plan to use complex queries later
# from django.db import models 


# --- Ride ViewSet (Used for Publishing POST and Passenger Search GET) ---
SEARCH_RADIUS_KM = 50 
class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.filter(is_active=True).order_by('start_time')
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)
        
    def get_queryset(self):
        # ... (Existing distance filtering logic is correct) ...
        queryset = self.queryset
        start_lat = self.request.query_params.get('start_lat')
        start_lng = self.request.query_params.get('start_lng')
        end_lat = self.request.query_params.get('end_lat')
        end_lng = self.request.query_params.get('end_lng')
        date = self.request.query_params.get('date') 

        if not all([start_lat, start_lng, end_lat, end_lng]):
            return queryset
        
        try:
            start_lat = float(start_lat)
            start_lng = float(start_lng)
            end_lat = float(end_lat)
            end_lng = float(end_lng)
        except (TypeError, ValueError):
            return queryset.none() 

        LAT_DEGREE_KM = 111
        LAT_DELTA = SEARCH_RADIUS_KM / LAT_DEGREE_KM
        
        start_proximity_filter = queryset.filter(
            pickup_latitude__gte=start_lat - LAT_DELTA,
            pickup_latitude__lte=start_lat + LAT_DELTA,
            pickup_longitude__gte=start_lng - LAT_DELTA,
            pickup_longitude__lte=start_lng + LAT_DELTA,
        )
        
        final_queryset = start_proximity_filter.filter(
            destination_latitude__gte=end_lat - LAT_DELTA,
            destination_latitude__lte=end_lat + LAT_DELTA,
            destination_longitude__gte=end_lng - LAT_DELTA,
            destination_longitude__lte=end_lng + LAT_DELTA,
        )
        
        if date:
            final_queryset = final_queryset.filter(start_time__date=date)

        return final_queryset

# --- 2. Booking Creation View (POST /api/bookings/) ---
class BookingCreateAPIView(APIView):
    """Handles POST requests to create a new booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 3. Driver Management ViewSet (GET/PATCH /api/driver/requests/) ---
class DriverBookingRequestViewSet(viewsets.ReadOnlyModelViewSet): 
    """CRITICAL: Shows ALL bookings for the current user's published rides."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This correctly shows ALL passenger requests (Pending, Accepted, Rejected) for the driver
        return Booking.objects.filter(ride__driver=self.request.user).order_by('-booked_at')

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def accept(self, request, pk=None):
        booking = get_object_or_404(Booking, pk=pk)
        if booking.ride.driver != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'PENDING':
            return Response({"detail": f"Booking is already {booking.status}"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'ACCEPTED'
        booking.save()
        return Response({'status': 'Booking accepted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        booking = get_object_or_404(Booking, pk=pk)
        if booking.ride.driver != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'PENDING':
            return Response({"detail": f"Booking is already {booking.status}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Release seats
        booking.ride.seats_available += booking.seats_booked
        booking.ride.save()

        booking.status = 'REJECTED'
        booking.save()
        return Response({'status': 'Booking rejected and seats released'}, status=status.HTTP_200_OK)

# --- 4. Passenger ViewSet (GET /api/passenger/bookings/) ---
class PassengerBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """Allows passengers to view their own ride requests."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(passenger=self.request.user).order_by('-booked_at')

# --- 5. Driver Published Rides ViewSet (GET /api/driver/published/) ---
class MyPublishedRidesViewSet(viewsets.ReadOnlyModelViewSet):
    """Allows a user to see the list of rides they have published."""
    serializer_class = RideSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ride.objects.filter(driver=self.request.user).order_by('-start_time')