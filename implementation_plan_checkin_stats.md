# Add Check-in Counter to Dashboard

## Goal
Display the number of participants who have physically checked in (scanned their QR code) on the Admin Dashboard, distinguishing them from those who only confirmed attendance online.

## Proposed Changes

### Service Layer
#### [MODIFY] [meetingService.ts](file:///d:/Sites%20em%20Geral/Sistema%20de%20Diaconos%20e%20Voluntarios/src/services/meetingService.ts)
- Update `getMeetingStats` to calculate `checkins` count.
- Count rows where `checkin_em` is not null.

### UI Layer
#### [MODIFY] [DashboardPage.tsx](file:///d:/Sites%20em%20Geral/Sistema%20de%20Diaconos%20e%20Voluntarios/src/pages/admin/DashboardPage.tsx)
- Add a new Card to the stats grid for "Check-ins Realizados".
- Use `QrCode` icon or similar for visual distinction.
- Update state interface to include `checkins`.

## Verification
- Manual verification: Scan a QR code using the app flow (or simulate DB update) and verify the "Check-ins" counter increments on the Dashboard.
