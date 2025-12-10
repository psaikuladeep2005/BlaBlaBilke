# blablabike_backend/urls.py (COMPLETE AND FINALIZED)

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    RideViewSet, 
    BookingCreateAPIView, 
    DriverBookingRequestViewSet, # Driver Dashboard View
    PassengerBookingViewSet,     # Passenger History View (MISSING IMPORT)
    MyPublishedRidesViewSet      # Driver Inventory View (MISSING IMPORT)
)

# Initialize the router
router = DefaultRouter()
router.register(r'rides', RideViewSet)

# Dedicated ViewSets for GET/PATCH requests
router.register(r'driver/requests', DriverBookingRequestViewSet, basename='driver-booking-requests')
router.register(r'passenger/bookings', PassengerBookingViewSet, basename='passenger-bookings') # <-- ADDED
router.register(r'driver/published', MyPublishedRidesViewSet, basename='my-published-rides') # <-- ADDED

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- AUTHENTICATION ROUTES ---
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
    
    # --- CUSTOM API ROUTES ---
    
    # 1. Booking Creation (POST only) - Dedicated APIView
    # Using 'bookings/' for the POST is fine, but ensure the endpoint is clear.
    path('api/bookings/', BookingCreateAPIView.as_view(), name='booking-create'), 
    
    # 2. Router URLs (Handles GET for /rides, /driver/requests, /passenger/bookings, etc.)
    path('api/', include(router.urls)),
]