# Coding Agent Memory

Project: `taxi_meik_swe`

Backend file being reduced: `backend/src/index.ts`

## Goal

Refactor the large backend entrypoint safely without changing working app flow, route paths, request/response shapes, or frontend behavior.

## Safety Rule

Do behavior-preserving route/helper extraction only.

After every step, run:

```bash
cd backend
npx tsc --noEmit
```

Also run `git diff --check` on the files touched in that step.

## Completed Steps

1. Extracted auth helpers:
   - `backend/src/lib/api-auth.ts`
   - Exports `requireUser`, `getAuthUser`, `AuthUser`

2. Extracted serializers:
   - `backend/src/lib/serializers.ts`
   - Includes `serializeUser`, `serializeCar`, `serializeBooking`, `serializePayment`, `serializeDeposit`, `serializeOwnerDocuments`, etc.

3. Extracted payment upload middleware:
   - `backend/src/lib/payment-upload.ts`
   - Exports `paymentUploadDir`, `uploadPaymentScreenshot`

4. Extracted booking/payment finance helpers:
   - `backend/src/lib/booking-finance.ts`
   - Includes `getPaymentQuote`, `getBookingPayment`, `getBookingDeposit`, `serializeBookingWithFinancials`, `ensureBookingPaymentStorage`, etc.

5. Extracted app setup:
   - `backend/src/lib/app-config.ts`
   - Exports `configureCoreMiddleware`, `configureStaticUploads`

6. Moved owner profile/docs routes:
   - `backend/src/routes/owner.routes.ts`
   - Mounted as `app.use("/api/owner", ownerRouter)`

7. Moved admin owner/car verification routes:
   - `backend/src/routes/admin-verifications.routes.ts`
   - Mounted as `app.use("/api/admin", adminVerificationsRouter)`

8. Moved owner car management routes:
   - `backend/src/routes/owner-cars.routes.ts`
   - Mounted as `app.use("/api/owner/cars", ownerCarsRouter)`

9. Moved public car routes:
   - `backend/src/routes/cars.routes.ts`
   - Mounted as `app.use("/api/cars", carsRouter)`

10. Moved driver booking routes:
   - `backend/src/routes/driver-bookings.routes.ts`
   - Mounted as `app.use("/api/driver/bookings", driverBookingsRouter)`

11. Moved owner booking routes:
   - `backend/src/routes/owner-bookings.routes.ts`
   - Mounted as `app.use("/api/owner/bookings", ownerBookingsRouter)`

12. Moved admin booking routes:
   - `backend/src/routes/admin-bookings.routes.ts`
   - Mounted as `app.use("/api/admin/bookings", adminBookingsRouter)`

13. Moved agreement routes:
   - `backend/src/routes/agreements.routes.ts`
   - Mounted as `app.use("/api/agreements", agreementsRouter)`

## Current State

`backend/src/index.ts` was reduced from `2736` lines to about `715` lines.

## Do Not Revert

There are unrelated existing user changes in the workspace. Do not touch or revert them unless explicitly requested:

- `frontend/src/features/driver/DriverCarDetailPage.tsx`
- `frontend/src/providers/AuthProvider.tsx`
- uploaded image files
- `.DS_Store` files

## Next Safe Step

Move booking payment routes into a router.

Candidate file:

```txt
backend/src/routes/booking-payments.routes.ts
```

Likely routes:

- `POST /api/bookings/:id/payments`
- `GET /api/bookings/:id/payments`
- `GET /api/driver/payments`
- `GET /api/owner/payments`
- `GET /api/admin/payments/pending`
- `POST /api/admin/payments/:id/confirm`
- `POST /api/admin/payments/:id/reject`

Mount:

```ts
app.use("/api", bookingPaymentsRouter);
```

## Caution

Booking payment routes touch:

- `uploadPaymentScreenshot`
- `ensureBookingPaymentStorage`
- `getBookingPayment`
- `getPaymentQuote`
- `serializePayment`
- `serializeIncompletePayment`
- `notifyAdminsAboutPayment`
- notifications
- owner/driver/admin authorization checks
- raw SQL insert/update conflict handling

Keep behavior identical.
