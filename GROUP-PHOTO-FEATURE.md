# Group Photo Upload & Enhanced Groups

## Fixed Issues

### 1. Notification Error
**Error:** `Notifications.removeNotificationSubscription is not a function`

**Fix:** Updated `app/_layout.tsx` to use `.remove()` instead of `removeNotificationSubscription()`

```javascript
// Old (broken)
Notifications.removeNotificationSubscription(notificationListener.current);

// New (fixed)
if (notificationListener.current && notificationListener.current.remove) {
  notificationListener.current.remove();
}
```

## New Features

### 1. Group Photo Upload
**File:** `app/create-group.tsx`

Users can now add a photo when creating a group:
- Tap the camera icon to select a photo from library
- Image is cropped to 1:1 aspect ratio
- Preview shown before creating group
- Can remove photo before submitting

**Implementation:**
- Uses `expo-image-picker` for photo selection
- Requests media library permissions
- Stores photo URI in group `avatar_url` field

### 2. Enhanced Group List
**File:** `app/(tabs)/groups.tsx`

Groups now display:
- **Group photo** (if uploaded) or initials avatar
- **Group name** with admin crown icon
- **Member count** (e.g., "5 members")
- **Creation date** (e.g., "Created Jan 15, 2026")

### 3. Database Update
**File:** `supabase-update-groups.sql`

Added new column to groups table:
```sql
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

Run this SQL in your Supabase SQL Editor to enable photo storage.

## How to Use

### Creating a Group with Photo:

1. Go to **Groups** tab
2. Tap **"Create Group"** FAB button
3. Tap the **camera icon** placeholder
4. Select a photo from your library
5. Photo appears in circular preview
6. Enter group name and add members
7. Tap **"Create Group"**

### Viewing Groups:

- Groups with photos show the uploaded image
- Groups without photos show colored initials
- Each group card shows:
  - Photo/avatar
  - Name with admin badge
  - Member count
  - Creation date
  - Tap to view group details

## Technical Details

### Dependencies Added:
```bash
npm install expo-image-picker --legacy-peer-deps
```

### Files Modified:
1. `app/_layout.tsx` - Fixed notification cleanup
2. `app/create-group.tsx` - Added photo picker
3. `app/(tabs)/groups.tsx` - Display photos and dates
4. `package.json` - Added expo-image-picker

### Database Schema:
```sql
groups table:
  - id (uuid)
  - name (text)
  - avatar_url (text) -- NEW
  - created_by (uuid)
  - created_at (timestamp)
```

## Future Enhancements

Potential additions:
- Upload photos to Supabase Storage (currently using local URI)
- Edit group photo after creation
- Group photo in group detail screen
- Compress images before upload
- Multiple photo formats (JPEG, PNG, WEBP)

## Testing

1. **Create group with photo:**
   - Open app → Groups tab
   - Create Group → Add photo
   - Verify photo appears in group list

2. **Create group without photo:**
   - Create Group → Skip photo
   - Verify initials avatar shows

3. **View group details:**
   - Tap any group card
   - Verify all info displays correctly

## Permissions

App requests:
- **Media Library Access** - To select photos for group avatars
- Auto-requested when user taps camera icon
- Graceful fallback if permission denied

## Platform Support

- ✅ iOS - Full support
- ✅ Android - Full support  
- ✅ Web - Full support (uses file input)

All features work across all platforms!
