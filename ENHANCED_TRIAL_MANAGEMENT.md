# Enhanced Trial Subscriptions Management

## New Features Added

### 1. **Force Start Trial**
- Allows admin to start a trial even if it was already used
- Custom duration can be set (1-365 days)
- Overrides any existing trial status
- Useful for special cases or customer support

### 2. **Pause/Resume Trial**
- **Pause**: Temporarily suspends trial access without affecting end date
- **Resume**: Restores trial access immediately
- Gym loses access when paused but can be resumed anytime
- Useful for handling disputes or temporary suspensions

### 3. **Force Expire Trial**
- Immediately expires an active or paused trial
- Sets trial_end_date to current date
- Cannot be undone (must use reset or force start to restore)
- Useful for emergency situations

### 4. **Bulk Operations**
- Select multiple gyms and perform operations on all at once
- Supported operations:
  - Extend Trials (with custom days)
  - Reset Trials
  - Pause Trials
  - Resume Trials
  - Force Expire Trials
  - Force Start Trials (with custom duration)
- Confirmation dialog shows number of selected gyms

### 5. **Enhanced UI/UX**
- **Dropdown Actions Menu**: All actions organized in a clean dropdown
- **Row Selection**: Checkbox selection for bulk operations
- **Status Tags**: Added "Paused" status with gold color
- **Bulk Actions Button**: Shows count of selected items
- **Clear Selection**: Easy way to deselect all items

### 6. **Improved Backend Logic**
- **Paused Status**: New trial status added to Gym model
- **Middleware Update**: Subscription middleware handles paused trials
- **Service Methods**: New methods in TrialService for all operations
- **Error Handling**: Proper validation and error messages

## API Endpoints Added

```
POST /api/subscription/admin/trials/:gymId/force-start
POST /api/subscription/admin/trials/:gymId/pause
POST /api/subscription/admin/trials/:gymId/resume
POST /api/subscription/admin/trials/:gymId/force-expire
POST /api/subscription/admin/trials/bulk
```

## Database Changes

### Gym Model Updates
- Added `'paused'` to `trial_status` enum
- Middleware now blocks access for paused trials

## Usage Examples

### Force Start Trial
```javascript
// Start 45-day trial regardless of current status
await api.post('/subscription/admin/trials/gymId/force-start', {
  customDuration: 45
});
```

### Bulk Operations
```javascript
// Extend multiple trials by 14 days
await api.post('/subscription/admin/trials/bulk', {
  gymIds: ['gym1', 'gym2', 'gym3'],
  operation: 'extend',
  options: { additionalDays: 14 }
});
```

## Benefits

1. **Complete Control**: Admins can now handle any trial scenario
2. **Efficiency**: Bulk operations save time for large-scale changes
3. **Flexibility**: Custom durations and force operations for special cases
4. **User Experience**: Clean UI with organized actions and clear feedback
5. **Support Ready**: Tools to handle customer support requests effectively

## Security & Validation

- All operations require admin role
- Proper validation for duration limits (1-365 days)
- Confirmation dialogs for destructive operations
- Error handling with user-friendly messages
- Middleware prevents access during paused state

## Status Flow

```
available → force_start → active
active → pause → paused
paused → resume → active
active → extend → active (extended)
active/paused → expire → expired
expired/used → reset → available
any_status → force_start → active
```

This enhanced system provides comprehensive trial management capabilities that address all common scenarios and edge cases that admins might encounter.