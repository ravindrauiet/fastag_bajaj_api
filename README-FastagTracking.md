# FasTag Registration Tracking System

## Overview

This system enhances the existing FasTag registration flow with a robust tracking mechanism that records each stage of the process in Firebase. It captures user context, stage progression, and provides a queryable database of registrations.

The implementation is designed to work alongside the existing code without modifying it, providing an additional layer of tracking while preserving the current functionality.

## Key Features

1. **User Context Tracking**
   - Records Firebase Auth UID and display name when a user is logged in
   - Links form submissions to authenticated users
   - Supports anonymous submissions as well

2. **Stage Tracking**
   - Breaks the registration process into defined stages:
     - Customer Validation
     - OTP Verification
     - Document Upload
     - Manual Activation
     - FasTag Registration
   - Records timestamps for each stage
   - Maintains a complete history of the registration process

3. **Data Structure**
   - Uses two collections in Firebase:
     - `fastagRegistrations`: Main document for each registration
     - `registrationStages`: Individual stage completions (for analytics)
   - Stores session ID from API responses
   - Preserves all form data for each stage

## Implementation Details

The system consists of the following components:

1. **FasTagTracker.js**
   - Core tracking functionality
   - Manages Firebase data storage
   - Handles user authentication status

2. **FasTagRegistrationHelper.js**
   - Convenience methods for specific stages
   - Abstracts away the complexity of the tracking system

3. **FormLogger.js (enhanced)**
   - Existing logger with added FasTag tracking
   - Automatically tracks FasTag stages when related forms are submitted

4. **FormTracker.js (enhanced)**
   - Integrates FasTag tracking with existing form tracking
   - Preserves backward compatibility

5. **fastagRegistrationsApi.js**
   - Retrieval methods for registrations
   - Supports filtering and pagination
   - Provides access to stage history

## Data Model

### fastagRegistrations Collection

Each document represents a complete FasTag registration process:

```javascript
{
  id: "unique-document-id",
  currentStage: "fastag-registration",
  startedAt: Timestamp,
  updatedAt: Timestamp,
  mobileNo: "9876543210",  // For easy querying
  vehicleNo: "MH01AB1234", // For easy querying
  isAuthenticated: true,
  user: {
    uid: "firebase-auth-uid",
    displayName: "User Name",
    email: "user@example.com"
  },
  stages: {
    "validate-customer": {
      stage: "validate-customer",
      data: { /* form data */ },
      status: "completed",
      timestamp: Timestamp,
      stageCompletedAt: Timestamp,
      sessionId: "api-session-id",
      user: { /* user info at this stage */ }
    },
    "validate-otp": {
      /* similar structure */
    },
    /* other stages */
  }
}
```

### registrationStages Collection

Each document represents a single stage completion:

```javascript
{
  id: "unique-document-id",
  registrationId: "parent-registration-id",
  stage: "validate-customer",
  data: { /* form data */ },
  status: "completed",
  timestamp: Timestamp,
  stageCompletedAt: Timestamp,
  sessionId: "api-session-id",
  user: {
    uid: "firebase-auth-uid",
    displayName: "User Name",
    email: "user@example.com"
  }
}
```

## Usage

The system is integrated with the existing form submission logic and works transparently. No changes are needed to the existing components.

For admin purposes, the following methods are available:

```javascript
// Get all registrations with filters
const { registrations } = await fastagRegistrationsApi.getAllRegistrations({
  mobileNo: "9876543210",
  limit: 20
});

// Get a specific registration by ID
const { registration } = await fastagRegistrationsApi.getRegistrationById(registrationId);

// Get all stages for a registration
const { stages } = await fastagRegistrationsApi.getRegistrationStages(registrationId);

// Get registrations by user
const { registrations } = await fastagRegistrationsApi.getRegistrationsByUser(userId);
```

## Integration Points

The system automatically integrates at these points:

1. When `FormLogger.logFormAction()` is called with FasTag-related form types
2. When `trackFormSubmission()` is called with FasTag-related form types
3. Directly through the `FasTagRegistrationHelper` methods

No modifications to existing form submission logic were made, preserving the current functionality while adding the new tracking capability. 