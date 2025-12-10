from django.db import models

# Create your models here.
# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Additional fields for blablabike

    # We'll use a simple choice field for the role
    # It's better to keep one user for flexibility
    # The actual 'role' (passenger/driver) is determined by the action (publishing a ride vs. booking one)
    # But we can add a preference field or a simple phone number field

    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)

    # User preference (can be changed later)
    is_driver = models.BooleanField(default=False) 

    # We can add more fields later like bio, profile_pic, etc.

    # We need to specify a unique field for login, we'll keep the default (username) 
    # but you can change it to email or phone_number if you prefer later.

    def __str__(self):
        return self.username
# core/models.py

from django.db import models
from .models import User  # Import your custom User model

class Ride(models.Model):
    # Foreign Key to the User who published the ride
    driver = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='published_rides'
    )
    
    # ------------------ Location Details ------------------
    # Storing the place name (human readable)
    pickup_address = models.CharField(max_length=255)
    destination_address = models.CharField(max_length=255)
    
    # Storing the geographical coordinates (Lat/Lng) for searching
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # ------------------ Ride Details ------------------
    start_time = models.DateTimeField()
    seats_available = models.PositiveSmallIntegerField(default=1)
    price_per_seat = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Can be used to store the full route polyline string from Maps API (optional)
    route_polyline = models.TextField(blank=True, null=True) 

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride from {self.pickup_address} to {self.destination_address} by {self.driver.username}"
    
    # core/models.py

from django.db import models
from django.contrib.gis.db import models as gis_models # If you implemented PostGIS, keep this
from .models import User, Ride

# Define Status Choices
BOOKING_STATUS_CHOICES = [
    ('PENDING', 'Pending Acceptance'),
    ('ACCEPTED', 'Accepted'),
    ('REJECTED', 'Rejected'),
    ('CANCELLED', 'Cancelled'),
]

class Booking(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='booked_rides')
    
    seats_booked = models.PositiveSmallIntegerField()
    
    status = models.CharField(
        max_length=10,
        choices=BOOKING_STATUS_CHOICES,
        default='PENDING',
        db_index=True # Index for faster lookup by status
    )
    
    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.seats_booked} seat(s) on Ride {self.ride.id} by {self.passenger.username}"

# ... (Keep existing Ride and User models) ...