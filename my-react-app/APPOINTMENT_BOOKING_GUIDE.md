# Multi-Service Appointment Booking System

## Overview
The appointment booking system has been updated to allow customers to select **multiple services** in a single appointment instead of booking one service at a time.

---

## Database Model (MongoDB Schema)

### Appointment Model (`newAppointmentModel.js`)

```javascript
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    customerId: {
      type: String,
      required: true,
      index: true // Clerk user ID
    },
    customerName: {
      type: String,
      required: true
    }
  },

  // Staff Information
  staff: {
    staffId: {
      type: String,
      required: true,
      index: true // Clerk user ID
    },
    staffName: {
      type: String,
      required: true
    }
  },

  // Services Array (Multiple services per appointment)
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
      },
      serviceName: {
        type: String,
        required: true
      },
      serviceCost: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],

  // Appointment Date & Time
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String, // Format: "HH:MM" (24-hour format, e.g., "14:30")
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM`
    }
  },

  // Total Cost (Auto-calculated from services)
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Optional Description/Notes
  description: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for efficient querying
appointmentSchema.index({ 'customer.customerId': 1, status: 1 });
appointmentSchema.index({ 'staff.staffId': 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Virtual for total duration (if needed)
appointmentSchema.virtual('totalDuration').get(function() {
  return this.services.reduce((total, service) => {
    return total + (service.serviceDuration || 0);
  }, 0);
});

module.exports = mongoose.model('Appointment', appointmentSchema);
```

---

### Service Model (`serviceModel.js`)

```javascript
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['Hair', 'Skin', 'Nails', 'Massage', 'Other'],
    default: 'Other'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
```

---

### User Model (`userModel.js`)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'staff', 'admin'],
    default: 'customer',
    index: true
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient role-based queries
userSchema.index({ role: 1, active: 1 });

module.exports = mongoose.model('User', userSchema);
```

---

## Frontend Changes Summary

### New Components
1. **BookAppointmentModal.jsx** - Main booking modal with 3 steps:
   - Step 1: Select multiple services
   - Step 2: Select staff member
   - Step 3: Select date, time, and add notes

### Updated Components
1. **CustomerDashboard.jsx**
   - Added "Book Appointment" button
   - Removed old ServiceSelection component
   - Shows recent appointments preview

2. **AppContext.jsx**
   - Updated `bookAppointment` function to handle new API response structure

3. **api.js**
   - Changed endpoint from `/api/appointments` to `/api/newAppointment`
   - Updated error handling

### Components to Delete (No Longer Used)
These components are now obsolete and can be safely deleted:
- `src/components/ServiceSelection.jsx`
- `src/components/StaffSelection.jsx`
- `src/components/TimeSlotSelection.jsx`

**Optional:** Keep them as backup during testing, then delete after confirming everything works.

---

## API Endpoint Specification

### Create Appointment
**POST** `/api/newAppointment`

**Headers:**
```json
{
  "Authorization": "Bearer <clerk_jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "customer": {
    "customerId": "user_2abc123...",
    "customerName": "John Doe"
  },
  "staff": {
    "staffId": "user_3xyz456...",
    "staffName": "Jane Smith"
  },
  "services": [
    {
      "serviceId": "507f1f77bcf86cd799439011",
      "serviceName": "Hair Cut",
      "serviceCost": 2500
    },
    {
      "serviceId": "507f1f77bcf86cd799439022",
      "serviceName": "Hair Color",
      "serviceCost": 5000
    }
  ],
  "appointmentDate": "2026-04-30",
  "appointmentTime": "14:00",
  "description": "Please use organic products"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "appointment": {
    "id": "507f1f77bcf86cd799439033",
    "customer": {
      "customerId": "user_2abc123...",
      "customerName": "John Doe"
    },
    "staff": {
      "staffId": "user_3xyz456...",
      "staffName": "Jane Smith"
    },
    "services": [
      {
        "serviceId": "507f1f77bcf86cd799439011",
        "serviceName": "Hair Cut",
        "serviceCost": 2500
      },
      {
        "serviceId": "507f1f77bcf86cd799439022",
        "serviceName": "Hair Color",
        "serviceCost": 5000
      }
    ],
    "appointmentDate": "2026-04-30T00:00:00.000Z",
    "appointmentTime": "14:00",
    "totalCost": 7500,
    "description": "Please use organic products",
    "createdAt": "2026-04-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid format)
- `404` - Staff member not found
- `409` - Staff member already booked at that time
- `500` - Server error

---

## Key Features

### Multi-Service Selection
- Customers can select multiple services in one appointment
- Total cost and duration calculated automatically
- Services displayed with description, price, and duration

### Smart Scheduling
- Date picker shows next 14 days
- Time slots: 8:00 AM - 5:00 PM (excluding 12:00-1:00 PM lunch)
- Prevents double-booking the same staff member

### User Experience
- 3-step wizard interface
- Progress indicator
- Back/Next navigation
- Success confirmation screen
- Form validation at each step

### Data Validation
- Backend validates all required fields
- Checks for past dates
- Validates time format (HH:MM)
- Verifies staff member exists and has correct role
- Checks for scheduling conflicts
- Auto-calculates total cost from database prices (prevents price manipulation)

---

## Testing Checklist

### Frontend Testing
- [ ] Open dashboard and click "Book Appointment" button
- [ ] Select multiple services (2-3 services)
- [ ] Verify total cost and duration updates
- [ ] Select a staff member
- [ ] Select a date and time
- [ ] Add optional notes
- [ ] Confirm booking
- [ ] Verify success message appears
- [ ] Check appointment appears in "My Appointments" tab

### Backend Testing (Postman)
- [ ] Test with 1 service
- [ ] Test with multiple services
- [ ] Test with missing required fields
- [ ] Test with invalid date (past date)
- [ ] Test with invalid time format
- [ ] Test with non-existent staff ID
- [ ] Test duplicate booking (same staff, date, time)
- [ ] Verify total cost is calculated from DB, not request

---

## Migration Steps

1. **Update Backend Model** (if not already done)
   - Use the `Appointment` model schema provided above
   - Ensure indexes are created

2. **Deploy Frontend Changes**
   - The new modal is already integrated
   - Old components can be deleted after testing

3. **Test the Flow**
   - Create test appointments with multiple services
   - Verify data in MongoDB

4. **Cleanup** (Optional)
   - Delete old components: ServiceSelection, StaffSelection, TimeSlotSelection
   - Remove any unused API functions

---

## Next Steps / Enhancements

- [ ] Add appointment conflict checking on frontend (real-time availability)
- [ ] Show staff availability calendar
- [ ] Add email notifications on booking confirmation
- [ ] Allow customers to edit/cancel appointments
- [ ] Add recurring appointments feature
- [ ] Admin dashboard for managing all appointments
- [ ] Staff dashboard to view their schedule

---

## Support

For issues or questions:
1. Check backend logs for error details
2. Check browser console for frontend errors
3. Verify Clerk authentication is working
4. Ensure MongoDB connection is active
5. Test API endpoints directly with Postman

---

**Last Updated:** April 25, 2026
