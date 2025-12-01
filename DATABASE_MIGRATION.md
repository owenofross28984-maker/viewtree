# Database Migration Required

## Add Description Column to Views Table

The following SQL needs to be run in your Supabase SQL Editor:

```sql
-- Add description column to views table
ALTER TABLE views 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN views.description IS 'Optional longer explanation of the view (max 1000 chars enforced in app)';
```

## Add Position Column to Views Table (for drag-and-drop ordering)

```sql
-- Add position column to control per-user ordering of views
ALTER TABLE views 
ADD COLUMN IF NOT EXISTS position integer;

-- Backfill a sensible default: newest views first per user
WITH ordered AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id
           ORDER BY created_at DESC
         ) - 1 AS new_position
  FROM views
)
UPDATE views v
SET position = o.new_position
FROM ordered o
WHERE v.id = o.id
  AND v.position IS NULL;

-- Optional: ensure no NULLs going forward
ALTER TABLE views ALTER COLUMN position SET NOT NULL;
```

## Remove Tier Column from Profiles Table (Optional - MVP is free for all)

```sql
-- Remove tier column since MVP is entirely free
ALTER TABLE profiles 
DROP COLUMN IF EXISTS tier;
```

## Summary of Changes

### Views Table
- **Added**: `description` (TEXT, nullable) - Optional detailed explanation of the view
- **Added**: `position` (integer, NOT NULL) - Explicit per-user order index for drag-and-drop
- Character limits enforced in application code:
  - `statement`: 200 characters (down from 240)
  - `description`: 1000 characters (new field)

### Profiles Table  
- **Removed**: `tier` column (no longer needed - MVP is free for everyone)
- **Removed**: Pro/customization fields (accentColor, cardStyle, etc. - removed from type definitions)
- **Ensure unique**: `username` has a unique index so no two accounts can share the same handle

## User-Facing Changes

1. **View Creation Flow**: Now has 7 steps instead of 6, with new optional "Description" step
2. **View Card Interaction**: Cards with descriptions show "Read more" button and expand on click to reveal full description
3. **Ordering**: Views are ordered by `position` (drag-and-drop) instead of creation time or pin
4. **Character Limits**: Clear character counters on all text fields (statement: 200, description: 1000)
5. **Pricing**: Removed pricing section from landing page - everything is free
6. **Settings**: Removed subscription toggle from settings page
7. **Usernames**: Signup now enforces a unique `@username` with live availability checks

## Ensure unique usernames in profiles

Run this in the Supabase SQL editor to guarantee that each profile has a unique handle:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
ON profiles (username);
```
