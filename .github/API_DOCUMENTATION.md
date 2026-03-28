# OLMarketplace API Documentation

Flutter Mobile App — REST API Reference

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Standard Response Format](#standard-response-format)
4. [HTTP Status Codes](#http-status-codes)
5. [Public Endpoints](#public-endpoints)
   - [General Settings](#general-settings)
   - [Policies](#policies)
   - [Products](#products)
   - [Product Details](#product-details)
   - [Categories](#categories)
   - [Province List](#province-list)
   - [City / Municipality List](#city--municipality-list)
   - [Shipment Cost (Public)](#shipment-cost-public)
   - [Languages](#languages)
   - [Language Data](#language-data)
6. [Auth Endpoints](#auth-endpoints)
   - [Login](#login)
   - [Register](#register)
   - [Forgot Password — Send Code](#forgot-password--send-code)
   - [Forgot Password — Verify Code](#forgot-password--verify-code)
   - [Reset Password](#reset-password)
7. [Account Verification](#account-verification)
   - [Check Authorization Status](#check-authorization-status)
   - [Resend Verification Code](#resend-verification-code)
   - [Verify Email](#verify-email)
   - [Verify SMS](#verify-sms)
   - [Verify 2FA (Google Authenticator)](#verify-2fa-google-authenticator)
8. [User Account](#user-account)
   - [Get User Info](#get-user-info)
   - [Dashboard](#dashboard)
   - [Update Profile](#update-profile)
   - [Change Password](#change-password)
   - [Change OLPIN](#change-olpin)
   - [Transaction History](#transaction-history)
   - [Logout](#logout)
9. [Withdraw](#withdraw)
   - [List Withdraw Methods](#list-withdraw-methods)
   - [Create Withdraw Request](#create-withdraw-request)
   - [Confirm Withdraw Request](#confirm-withdraw-request)
   - [Withdraw History](#withdraw-history)
10. [Deposit / Payment](#deposit--payment)
    - [List Payment Gateways](#list-payment-gateways)
    - [Deposit History](#deposit-history)
    - [Initiate Deposit](#initiate-deposit)
    - [Confirm App Payment](#confirm-app-payment)
11. [Cart](#cart)
    - [Get Cart](#get-cart)
    - [Add to Cart](#add-to-cart)
    - [Update Cart Item](#update-cart-item)
    - [Remove Cart Item](#remove-cart-item)
    - [Clear Cart](#clear-cart)
    - [Apply Voucher](#apply-voucher)
12. [Checkout](#checkout)
    - [Get Checkout Summary](#get-checkout-summary)
    - [Get Shipment Cost (Checkout)](#get-shipment-cost-checkout)
    - [Place Order](#place-order)
13. [Orders](#orders)
    - [List Orders](#list-orders)
    - [Order Details](#order-details)
    - [Cancel Order](#cancel-order)
    - [Rate Order](#rate-order)
14. [Support Tickets](#support-tickets)
    - [List Tickets](#list-tickets)
    - [Create Ticket](#create-ticket)
    - [View Ticket](#view-ticket)
    - [Reply to Ticket](#reply-to-ticket)
    - [Close Ticket](#close-ticket)
15. [Plans](#plans)
    - [List Plans](#list-plans)
    - [Subscribe to a Plan](#subscribe-to-a-plan)
    - [BV Log](#bv-log)
    - [Binary Commission](#binary-commission)
    - [Binary Summary (Group Sales)](#binary-summary-group-sales)
    - [My Referral](#my-referral)
16. [Balance Transfer](#balance-transfer)
    - [Transfer Info](#transfer-info)
    - [Cash Wallet Transfer](#cash-wallet-transfer)
    - [Registration Wallet Transfer](#registration-wallet-transfer)
    - [Merchant Transfer](#merchant-transfer)
    - [Search User](#search-user)
17. [Enumerations & Status Codes](#enumerations--status-codes)

---

## Overview

| Property    | Value                              |
|-------------|------------------------------------|
| Base URL    | `https://yourdomain.com/api/`      |
| Format      | JSON (`Content-Type: application/json`) |
| Auth Method | Laravel Sanctum — Bearer Token     |
| Pagination  | `page` query parameter (default 10–15 results per page) |

---

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

The token is returned in the response body of the [Login](#login) and [Register](#register) endpoints.

---

## Standard Response Format

All responses follow this envelope:

```json
{
  "status": "success | error",
  "message": "Human-readable description",
  "data": { }
}
```

- `status` — `"success"` or `"error"`.
- `message` — present on errors and most write operations; omitted on some list endpoints.
- `data` — the actual payload; can be an object, array, or paginated collection.

### Paginated Response Shape

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [ ],
    "first_page_url": "...",
    "from": 1,
    "last_page": 5,
    "last_page_url": "...",
    "next_page_url": "...",
    "path": "...",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 72
  }
}
```

### Validation Error Response (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error description."]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning                                  |
|------|------------------------------------------|
| 200  | OK — successful GET / action             |
| 201  | Created — resource successfully created  |
| 401  | Unauthorized — bad credentials           |
| 403  | Forbidden — account disabled or banned   |
| 404  | Not Found — resource does not exist      |
| 422  | Unprocessable Entity — validation failed or business rule violation |
| 429  | Too Many Requests — rate limit exceeded  |

---

## Public Endpoints

No authentication token required.

---

### General Settings

Returns the full global site configuration used by the app.

**GET** `/api/general-setting`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "sitename": "OLMarketplace",
    "cur_text": "OLC",
    "cur_sym": "₱",
    "base_color": "b2d566",
    "secondary_color": "80af46",
    "active_template": "basic",
    "ev": 0,
    "en": 0,
    "sv": 0,
    "sn": 0,
    "force_ssl": 0,
    "secure_password": 0,
    "agree": 1,
    "registration": 1,
    "autodebit": 0,
    "lock_referral": 0,
    "lock_bds_indirect": 0,
    "lock_binary": 0,
    "lock_unilevel": 0,
    "trial_limit_hours": 72,
    "expiration_warning_days": 3,
    "smb_limit_days": 30,
    "bv_price": "10.00000000",
    "total_bv": "100.00000000",
    "max_bv": 5000,
    "cary_flash": 0,
    "bal_trans_per_charge": "0.00",
    "bal_trans_fixed_charge": "0.00000000",
    "payout_percentage": "70.00000000",
    "company_percentage": "20.00000000",
    "user_percentage": "5.00000000",
    "manager_percentage": "5.00000000",
    "matrix_width": 0,
    "matrix_height": 4,
    "bds_width": 0,
    "bds_height": 4,
    "matching_bonus_time": "daily",
    "matching_when": "1",
    "company_user": 11,
    "notice": "<p>All User notice...</p>",
    "free_user_notice": "<p>Free User notice...</p>",
    "last_paid": null,
    "last_cron": "2021-12-07T16:47:01.000000Z",
    "created_at": null,
    "updated_at": "2023-11-23T18:46:45.000000Z",
    "sys_version": null,
    "email_from": "do-not-reply@example.com",
    "mail_config": { "name": "php" },
    "sms_config": { "name": "clickatell" }
  }
}
```

##### Core Site Fields

| Field              | Type    | Description                                              |
|--------------------|---------|----------------------------------------------------------|
| `id`               | integer | Record ID (always `1`)                                   |
| `sitename`         | string  | Application / site name                                  |
| `cur_text`         | string  | Currency code (e.g. `OLC`, `USD`)                        |
| `cur_sym`          | string  | Currency symbol (e.g. `₱`, `$`)                          |
| `base_color`       | string  | Primary brand colour (hex without `#`)                   |
| `secondary_color`  | string  | Secondary brand colour (hex without `#`)                 |
| `active_template`  | string  | Active frontend template name                            |

##### Feature-Flag Fields

| Field               | Type    | Description                                             |
|---------------------|---------|---------------------------------------------------------|
| `ev`                | integer | `1` = Email verification required                       |
| `en`                | integer | `1` = Email notifications enabled                       |
| `sv`                | integer | `1` = SMS verification required                         |
| `sn`                | integer | `1` = SMS notifications enabled                         |
| `force_ssl`         | integer | `1` = Force HTTPS site-wide                             |
| `secure_password`   | integer | `1` = Strong-password policy enforced                   |
| `agree`             | integer | `1` = Terms acceptance required at registration         |
| `registration`      | integer | `1` = Public registration enabled                       |
| `autodebit`         | integer | `1` = Auto-debit on plan renewal enabled                |
| `cary_flash`        | integer | `1` = Carry-flash feature enabled                       |

##### Earning-Lock Fields

| Field               | Type    | Description                                             |
|---------------------|---------|---------------------------------------------------------|
| `lock_referral`     | integer | `1` = Referral commission earnings locked when plan expires |
| `lock_bds_indirect` | integer | `1` = BDS indirect earnings locked when plan expires    |
| `lock_binary`       | integer | `1` = Binary earnings locked when plan expires          |
| `lock_unilevel`     | integer | `1` = Unilevel earnings locked when plan expires        |

##### Plan / Membership Fields

| Field                   | Type    | Description                                         |
|-------------------------|---------|-----------------------------------------------------|
| `trial_limit_hours`     | integer | Trial period duration in hours                      |
| `expiration_warning_days` | integer | Days before plan expiry to show warning            |
| `smb_limit_days`        | integer | Days after which Super Matching Bonus is released   |

##### Commission / BV Fields

| Field                   | Type    | Description                                         |
|-------------------------|---------|-----------------------------------------------------|
| `bv_price`              | decimal | Value of one BV point in currency                   |
| `total_bv`              | decimal | Total BV in circulation                             |
| `max_bv`                | integer | Maximum BV cap                                      |
| `bal_trans_per_charge`  | decimal | Balance-transfer percentage charge                  |
| `bal_trans_fixed_charge`| decimal | Balance-transfer fixed charge                       |
| `payout_percentage`     | decimal | Payout share percentage                             |
| `company_percentage`    | decimal | Company share percentage                            |
| `user_percentage`       | decimal | User share percentage                               |
| `manager_percentage`    | decimal | Manager share percentage                            |

##### MLM Structure Fields

| Field                | Type    | Description                                            |
|----------------------|---------|--------------------------------------------------------|
| `matrix_width`       | integer | Unilevel matrix width                                  |
| `matrix_height`      | integer | Unilevel matrix height (levels)                        |
| `bds_width`          | integer | BDS matrix width                                       |
| `bds_height`         | integer | BDS matrix height (levels)                             |
| `matching_bonus_time`| string  | Matching bonus schedule: `daily`, `weekly`, `monthly`  |
| `matching_when`      | string  | Scheduled day or time slot for matching bonus payout   |
| `company_user`       | integer | User ID assigned as the company root node              |

##### Notice / Content Fields

| Field              | Type   | Description                                              |
|--------------------|--------|----------------------------------------------------------|
| `notice`           | string | HTML notice shown to all users                           |
| `free_user_notice` | string | HTML notice shown to users without an active plan        |

##### System / Timestamp Fields

| Field         | Type     | Description                           |
|---------------|----------|---------------------------------------|
| `last_paid`   | datetime | Timestamp of the last payout run      |
| `last_cron`   | datetime | Timestamp of the last cron execution  |
| `sys_version` | string   | Installed system version string       |
| `created_at`  | datetime | Record creation timestamp             |
| `updated_at`  | datetime | Record last-updated timestamp         |

> **Note:** The response also includes `email_from`, `email_template`, `sms_api`, `mail_config`, and `sms_config`. These are server-side configuration fields returned by the full model; the mobile app should ignore them.

---

### Policies

Returns the site's policy pages (terms, privacy, etc.).

**GET** `/api/policies`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "data_values": {
        "title": "Privacy Policy",
        "description": "..."
      }
    }
  ]
}
```

---

### Products

Returns a paginated list of active products. Supports filtering and search.

**GET** `/api/products`

#### Query Parameters

| Parameter     | Type    | Required | Description                            |
|---------------|---------|----------|----------------------------------------|
| `category_id` | integer | No       | Filter products by category ID         |
| `search`      | string  | No       | Search products by name (partial match)|
| `page`        | integer | No       | Page number for pagination             |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Product Name",
        "price": 499.00,
        "quantity": 50,
        "category_id": 2,
        "status": 1,
        "image": "products/image.jpg",
        "description": "...",
        "category": {
          "id": 2,
          "name": "Electronics"
        }
      }
    ],
    "total": 100,
    "per_page": 12,
    "last_page": 9
  }
}
```

---

### Product Details

Returns a single product with up to 10 related products from the same category.

**GET** `/api/products/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Product ID  |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": 1,
      "name": "Product Name",
      "price": 499.00,
      "quantity": 50,
      "category_id": 2,
      "status": 1,
      "image": "products/image.jpg",
      "description": "...",
      "plan_id": 0
    },
    "relateds": [
      {
        "id": 3,
        "name": "Related Product",
        "price": 299.00
      }
    ]
  }
}
```

#### Response `404`
```json
{
  "message": "No query results for model [App\\Models\\Product]."
}
```

---

### Categories

Returns all active categories.

**GET** `/api/categories`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "image": "categories/image.jpg",
      "status": 1
    }
  ]
}
```

---

### Province List

Returns provinces belonging to a specific region code (Philippine geography).

**GET** `/api/getProvince/{regionId}`

#### Path Parameters

| Parameter  | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `regionId` | string | Yes      | Region code (e.g. `"01"`, `"NCR"`) |

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "code": "0128",
      "name": "ILOCOS NORTE"
    }
  ]
}
```

---

### City / Municipality List

Returns cities/municipalities belonging to a specific province code.

**GET** `/api/getCityMun/{provinceId}`

#### Path Parameters

| Parameter    | Type   | Required | Description    |
|--------------|--------|----------|----------------|
| `provinceId` | string | Yes      | Province code  |

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "code": "012801",
      "name": "ADAMS"
    }
  ]
}
```

---

### Shipment Cost (Public)

Looks up the shipping cost for a given region/province/city combination. Resolution is from most specific (city) to least specific (region).

**POST** `/api/getShipmentCost`

#### Request Body

| Parameter  | Type   | Required | Description                         |
|------------|--------|----------|-------------------------------------|
| `region`   | string | Yes      | Region code or name                 |
| `province` | string | No       | Province code or name               |
| `city`     | string | No       | City/municipality code or name      |

#### Response `200` — Cost found
```json
{
  "status": "success",
  "data": {
    "base_cost": 150.00,
    "addon_cost": 20.00,
    "base_qty": 1,
    "base_weight": 1.0
  }
}
```

#### Response `200` — No matching rule
```json
{
  "status": "success",
  "data": {
    "base_cost": 0,
    "addon_cost": 0
  }
}
```

| Field        | Type    | Description                               |
|--------------|---------|-------------------------------------------|
| `base_cost`  | decimal | Base shipping fee                         |
| `addon_cost` | decimal | Additional fee per extra item/kg          |
| `base_qty`   | integer | Quantity included in the base cost        |
| `base_weight`| decimal | Weight (kg) included in the base cost     |

---

### Languages

Returns all available app languages.

**GET** `/api/languages`

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "English",
      "code": "en",
      "is_default": 1
    }
  ]
}
```

---

### Language Data

Returns the full translation key-value map for a given language code.

**GET** `/api/language-data/{code}`

#### Path Parameters

| Parameter | Type   | Required | Description               |
|-----------|--------|----------|---------------------------|
| `code`    | string | Yes      | Language code (e.g. `en`) |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "language": {
      "id": 1,
      "name": "English",
      "code": "en",
      "is_default": 1
    },
    "translations": {
      "Home": "Home",
      "Cart": "Cart"
    }
  }
}
```

#### Response `404`
```json
{
  "status": "error",
  "message": "Language not found."
}
```

---

## Auth Endpoints

---

### Login

Authenticates a user with email/username and password, returning a Sanctum token.

**POST** `/api/login`

#### Request Body

| Parameter  | Type   | Required | Description                  |
|------------|--------|----------|------------------------------|
| `username` | string | Yes      | Email address or username    |
| `password` | string | Yes      | Account password             |

#### Response `200` — Successful login
```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "token": "1|abcdef1234567890...",
    "user": {
      "id": 42,
      "firstname": "Juan",
      "lastname": "Dela Cruz",
      "username": "juandc",
      "email": "juan@example.com",
      "mobile": "09171234567",
      "image": "user/avatar.jpg",
      "status": 1,
      "ev": 1,
      "sv": 0,
      "ts": 0,
      "tv": 1
    }
  }
}
```

| Field | Type    | Description                                           |
|-------|---------|-------------------------------------------------------|
| `token` | string | Sanctum Bearer token — store securely for future requests |
| `ev`  | integer | Email verified: `1` = verified, `0` = not verified    |
| `sv`  | integer | SMS verified: `1` = verified, `0` = not verified      |
| `ts`  | integer | Two-factor SMS enabled: `1` = enabled                 |
| `tv`  | integer | Two-factor app (G2FA) enabled: `1` = enabled          |

#### Response `401` — Bad credentials
```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

#### Response `403` — Account disabled
```json
{
  "status": "error",
  "message": "Your account has been disabled."
}
```

---

### Register

Creates a new user account and returns a Sanctum token.

**POST** `/api/register`

#### Request Body

| Parameter              | Type    | Required | Rules                                        |
|------------------------|---------|----------|----------------------------------------------|
| `firstname`            | string  | No       | max:50                                       |
| `lastname`             | string  | No       | max:50                                       |
| `email`                | string  | Yes      | Valid email, unique in `users` table         |
| `username`             | string  | Yes      | Alphanumeric, min:4, unique in `users` table |
| `password`             | string  | Yes      | Must be confirmed                            |
| `password_confirmation`| string  | Yes      | Must match `password`                        |
| `referral`             | string  | No       | Existing user's username                     |
| `position`             | integer | No       | Binary tree position (e.g. `1` = left, `2` = right) |

#### Response `201` — Account created
```json
{
  "status": "success",
  "message": "Registration successful.",
  "data": {
    "token": "2|xyz987...",
    "user": {
      "id": 43,
      "firstname": "Maria",
      "lastname": "Santos",
      "username": "mariasantos",
      "email": "maria@example.com",
      "mobile": null,
      "image": null,
      "status": 1,
      "ev": 0,
      "sv": 0
    }
  }
}
```

#### Response `422` — Validation or invalid referral
```json
{
  "status": "error",
  "message": "Invalid referral code."
}
```

---

### Forgot Password — Send Code

Finds an account by email or username and sends a 6-digit reset code to the account's email.

**POST** `/api/password/email`

#### Request Body

| Parameter | Type   | Required | Description                                                          |
|-----------|--------|----------|----------------------------------------------------------------------|
| `type`    | string | Yes      | `"email"` or `"username"`                                            |
| `value`   | string | Yes      | The email address (when `type=email`) or username (when `type=username`) |

#### Response `200`
```json
{
  "status": "success",
  "message": "A 6-digit verification code has been sent to your email.",
  "data": {
    "email": "j***@example.com"
  }
}
```

#### Response `422` — Account not found
```json
{
  "status": "error",
  "message": "Account not found."
}
```

---

### Forgot Password — Verify Code

Validates the 6-digit reset code. Returns the code as a `token` for use in the password reset step.

**POST** `/api/password/verify-code`

#### Request Body

| Parameter | Type   | Required | Description                                  |
|-----------|--------|----------|----------------------------------------------|
| `email`   | string | Yes      | The full email from the previous step        |
| `code`    | string | Yes      | The 6-digit code received in the email       |

#### Response `200`
```json
{
  "status": "success",
  "message": "Code verified.",
  "data": {
    "email": "juan@example.com",
    "token": "849201"
  }
}
```

#### Response `422` — Invalid code
```json
{
  "status": "error",
  "message": "Invalid verification code."
}
```

---

### Reset Password

Sets a new password using the verified token from the previous step.

**POST** `/api/password/reset`

#### Request Body

| Parameter              | Type   | Required | Description                              |
|------------------------|--------|----------|------------------------------------------|
| `email`                | string | Yes      | Account email                            |
| `token`                | string | Yes      | The 6-digit code from verify-code step   |
| `password`             | string | Yes      | New password                             |
| `password_confirmation`| string | Yes      | Must match `password`                    |

#### Response `200`
```json
{
  "status": "success",
  "message": "Password reset successfully."
}
```

#### Response `422` — Invalid token
```json
{
  "status": "error",
  "message": "Invalid reset token."
}
```

---

## Account Verification

All endpoints in this section require authentication (`Authorization: Bearer <token>`).

---

### Check Authorization Status

Checks whether the authenticated user needs to complete any verification step.

**GET** `/api/authorization`

> Call this after login. If `type` is present in the response, redirect the user to the corresponding verification screen.

#### Response `200` — Verification required
```json
{
  "status": "error",
  "message": "Please verify your email.",
  "data": {
    "type": "email_unverified"
  }
}
```

Possible `type` values:

| Value             | Action                                       |
|-------------------|----------------------------------------------|
| `banned`          | User is banned — show error and logout        |
| `email_unverified`| Redirect to email verification screen         |
| `sms_unverified`  | Redirect to SMS verification screen           |
| `2fa_required`    | Redirect to Google Authenticator 2FA screen   |

#### Response `200` — Account is fully verified
```json
{
  "status": "success",
  "message": "Account is fully authorized."
}
```

---

### Resend Verification Code

Sends a new verification code to the user's email or phone. Rate-limited to once every 2 minutes.

**POST** `/api/resend-verify`

#### Request Body

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `type`    | string | Yes      | `"email"` or `"phone"`   |

#### Response `200`
```json
{
  "status": "success",
  "message": "Verification code sent."
}
```

#### Response `429` — Rate limited
```json
{
  "status": "error",
  "message": "Please wait before requesting a new code."
}
```

---

### Verify Email

Verifies the user's email address using the code sent to their inbox.

**POST** `/api/verify-email`

#### Request Body

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `code`    | string | Yes      | 6-digit code sent to email     |

#### Response `200`
```json
{
  "status": "success",
  "message": "Email verified successfully."
}
```

#### Response `422` — Invalid code
```json
{
  "status": "error",
  "message": "Invalid verification code."
}
```

---

### Verify SMS

Verifies the user's phone number using the code sent via SMS.

**POST** `/api/verify-sms`

#### Request Body

| Parameter | Type   | Required | Description               |
|-----------|--------|----------|---------------------------|
| `code`    | string | Yes      | 6-digit code sent by SMS  |

#### Response `200`
```json
{
  "status": "success",
  "message": "Phone number verified successfully."
}
```

---

### Verify 2FA (Google Authenticator)

Verifies the time-based one-time password from the user's authenticator app.

**POST** `/api/verify-g2fa`

#### Request Body

| Parameter | Type   | Required | Description                               |
|-----------|--------|----------|-------------------------------------------|
| `code`    | string | Yes      | 6-digit TOTP from Google Authenticator    |

#### Response `200`
```json
{
  "status": "success",
  "message": "2FA verified successfully."
}
```

#### Response `422` — Invalid code
```json
{
  "status": "error",
  "message": "Invalid 2FA code."
}
```

---

## User Account

All endpoints require authentication.

---

### Get User Info

Returns the complete authenticated user object including their active plan.

**GET** `/api/user-info`

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 42,
    "firstname": "Juan",
    "lastname": "Dela Cruz",
    "username": "juandc",
    "email": "juan@example.com",
    "mobile": "09171234567",
    "country_code": "+63",
    "image": "user/avatar.jpg",
    "status": 1,
    "ev": 1,
    "sv": 0,
    "ts": 0,
    "tv": 0,
    "sw_balance": 1500.00,
    "w_balance": 250.00,
    "ref_id": 5,
    "plan_id": 2,
    "address": {
      "address": "123 Main St",
      "city": "Manila",
      "state": "Metro Manila",
      "zip": "1000",
      "country": "Philippines"
    },
    "plan": {
      "id": 2,
      "name": "Silver"
    }
  }
}
```

| Field        | Type    | Description                               |
|--------------|---------|-------------------------------------------|
| `sw_balance` | decimal | OLPay wallet balance (used for purchases) |
| `w_balance`  | decimal | Withdrawal balance                        |
| `ref_id`     | integer | Referrer's user ID                        |
| `plan_id`    | integer | Active plan ID (`0` = no plan)            |

---

### Dashboard

Returns summary statistics for the user's financial activity.

**GET** `/api/dashboard`

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "user": { },
    "total_deposit": 5000.00,
    "total_withdraw": 1200.00,
    "complete_withdraw": 3,
    "pending_withdraw": 1,
    "reject_withdraw": 0
  }
}
```

| Field               | Type    | Description                                         |
|---------------------|---------|-----------------------------------------------------|
| `total_deposit`     | decimal | Sum of all approved deposits                        |
| `total_withdraw`    | decimal | Sum of all approved withdrawals                     |
| `complete_withdraw` | integer | Count of approved (status=1) withdrawal requests    |
| `pending_withdraw`  | integer | Count of pending (status=2) withdrawal requests     |
| `reject_withdraw`   | integer | Count of rejected (status=3) withdrawal requests    |

---

### Update Profile

Updates the user's profile information. Send as `multipart/form-data` when uploading an image.

**POST** `/api/profile-setting`

#### Request Body

| Parameter         | Type   | Required | Rules                                     |
|-------------------|--------|----------|-------------------------------------------|
| `firstname`       | string | Yes      | max:50                                    |
| `lastname`        | string | Yes      | max:50                                    |
| `address`         | string | No       | max:80                                    |
| `state`           | string | No       | max:80                                    |
| `zip`             | string | No       | max:40                                    |
| `city`            | string | No       | max:50                                    |
| `country`         | string | No       | max:50                                    |
| `mobile`          | string | No       | max:20                                    |
| `country_code`    | string | No       | max:10 (e.g. `+63`)                       |
| `beneficiary_name`| string | No       | max:255                                   |
| `image`           | file   | No       | jpg, jpeg, or png image                   |

#### Response `200`
```json
{
  "status": "success",
  "message": "Profile updated successfully.",
  "data": {
    "id": 42,
    "firstname": "Juan",
    "lastname": "Dela Cruz"
  }
}
```

---

### Change Password

Updates the user's login password.

**POST** `/api/change-password`

#### Request Body

| Parameter              | Type   | Required | Description                        |
|------------------------|--------|----------|------------------------------------|
| `current_password`     | string | Yes      | The current account password       |
| `password`             | string | Yes      | New password (must be confirmed)   |
| `password_confirmation`| string | Yes      | Must match `password`              |

> **Note:** If `secure_password` is enabled in site settings, the new password must contain mixed case, numbers, symbols, and must not be a known compromised password.

#### Response `200`
```json
{
  "status": "success",
  "message": "Password changed successfully."
}
```

#### Response `422` — Wrong current password
```json
{
  "status": "error",
  "message": "Current password does not match."
}
```

---

### Change OLPIN

Updates the user's OLPIN (wallet PIN used for checkout). If no PIN exists yet, one is created.

**POST** `/api/change-pin`

#### Request Body

| Parameter        | Type   | Required | Rules                     |
|------------------|--------|----------|---------------------------|
| `current_pin`    | string | Yes      | Existing OLPIN            |
| `pin`            | string | Yes      | New PIN, min:6, confirmed |
| `pin_confirmation`| string | Yes     | Must match `pin`          |

#### Response `200`
```json
{
  "status": "success",
  "message": "OLPIN changed successfully."
}
```

#### Response `422` — Wrong current PIN
```json
{
  "status": "error",
  "message": "Current OLPIN does not match."
}
```

---

### Transaction History

Returns a paginated list of all wallet transactions (debits and credits) for the authenticated user.

**GET** `/api/transactions`

#### Query Parameters

| Parameter | Type    | Required | Description    |
|-----------|---------|----------|----------------|
| `page`    | integer | No       | Page number    |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 101,
        "user_id": 42,
        "amount": 499.00,
        "post_balance": 1001.00,
        "charge": 0,
        "trx_type": "-",
        "details": "Product Name item purchase",
        "trx": "TRX20240601ABCD",
        "created_at": "2024-06-01T10:00:00.000000Z"
      }
    ],
    "total": 25,
    "per_page": 15,
    "last_page": 2
  }
}
```

| Field         | Type    | Description                                   |
|---------------|---------|-----------------------------------------------|
| `trx_type`    | string  | `"+"` = credit, `"-"` = debit                 |
| `post_balance`| decimal | Wallet balance after this transaction          |
| `trx`         | string  | Unique transaction reference number            |

---

### Logout

Revokes the current Sanctum token.

**GET** `/api/logout`

#### Response `200`
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

---

## Withdraw

All endpoints require authentication.

---

### List Withdraw Methods

Returns all active withdrawal methods and their fee/limit details.

**GET** `/api/withdraw/methods`

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "GCash",
      "min_limit": 100.00,
      "max_limit": 50000.00,
      "fixed_charge": 10.00,
      "percent_charge": 1.5,
      "rate": 1,
      "currency": "PHP",
      "description": "Withdraw to your GCash account.",
      "status": 1
    }
  ]
}
```

---

### Create Withdraw Request

Initiates a withdrawal request. The amount is not deducted until the admin approves it.

**POST** `/api/withdraw/store`

#### Request Body

| Parameter     | Type    | Required | Description                            |
|---------------|---------|----------|----------------------------------------|
| `method_code` | integer | Yes      | The ID of the withdraw method          |
| `amount`      | decimal | Yes      | Amount to withdraw (must be > 0)       |

#### Response `201`
```json
{
  "status": "success",
  "message": "Withdrawal request created.",
  "data": {
    "id": 55,
    "method_id": 1,
    "user_id": 42,
    "amount": 500.00,
    "currency": "PHP",
    "rate": 1,
    "charge": 17.50,
    "after_charge": 482.50,
    "final_amount": 482.50,
    "trx": "WTH20240601WXYZ",
    "status": 0,
    "created_at": "2024-06-01T10:30:00.000000Z"
  }
}
```

| Field          | Type    | Description                                                      |
|----------------|---------|------------------------------------------------------------------|
| `charge`       | decimal | Total fee (fixed + percentage)                                   |
| `after_charge` | decimal | Amount after fees deducted (`amount - charge`)                   |
| `final_amount` | decimal | Amount the user receives in the method's currency (`after_charge * rate`) |
| `trx`          | string  | Transaction reference                                            |
| `status`       | integer | `0` = pending, `1` = approved, `2` = processing, `3` = rejected |

#### Response `422` — Business rule violation
```json
{
  "status": "error",
  "message": "Insufficient balance."
}
```

---

### Confirm Withdraw Request

Retrieves a pending withdrawal by transaction reference for final review before confirming additional details (e.g. account number).

**POST** `/api/withdraw/confirm`

#### Request Body

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `trx`     | string | Yes      | Transaction reference   |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 55,
    "trx": "WTH20240601WXYZ",
    "amount": 500.00,
    "charge": 17.50,
    "final_amount": 482.50,
    "status": 0,
    "method": {
      "id": 1,
      "name": "GCash"
    },
    "user": {
      "id": 42,
      "username": "juandc"
    }
  }
}
```

---

### Withdraw History

Returns a paginated list of the authenticated user's withdrawal requests.

**GET** `/api/withdraw/history`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 55,
        "amount": 500.00,
        "charge": 17.50,
        "final_amount": 482.50,
        "currency": "PHP",
        "trx": "WTH20240601WXYZ",
        "status": 1,
        "created_at": "2024-06-01T10:30:00.000000Z",
        "method": {
          "id": 1,
          "name": "GCash"
        }
      }
    ],
    "total": 10,
    "per_page": 15
  }
}
```

---

## Deposit / Payment

All endpoints require authentication.

---

### List Payment Gateways

Returns all active payment gateways with their supported currencies and fee details.

**GET** `/api/deposit/methods`

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "PayMongo",
      "code": 1001,
      "status": 1,
      "currencies": [
        {
          "id": 3,
          "gateway_id": 1,
          "currency": "PHP",
          "symbol": "₱",
          "min_amount": 100.00,
          "max_amount": 100000.00,
          "percent_charge": 2.5,
          "fixed_charge": 0,
          "rate": 1
        }
      ]
    }
  ]
}
```

---

### Deposit History

Returns a paginated list of the user's deposit records.

**GET** `/api/deposit/history`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 10,
        "user_id": 42,
        "method_code": 1001,
        "method_currency": "PHP",
        "amount": 1000.00,
        "charge": 25.00,
        "rate": 1,
        "final_amo": 1025.00,
        "trx": "DEP20240601PQRS",
        "status": 1,
        "created_at": "2024-06-01T08:00:00.000000Z",
        "gateway": {
          "id": 1,
          "name": "PayMongo"
        }
      }
    ],
    "total": 5,
    "per_page": 15
  }
}
```

| Field       | Type    | Description                                        |
|-------------|---------|----------------------------------------------------|
| `final_amo` | decimal | Total charged to user's payment method (amount + charge) * rate |
| `status`    | integer | `0` = pending, `1` = approved, `2` = cancelled, `3` = rejected |

---

### Initiate Deposit

Creates a pending deposit record and invokes the payment gateway to produce the URL or form data needed to complete the payment. The response `type` field tells the client how to handle the payment flow.

**POST** `/api/deposit/insert`

#### Request Body

| Parameter     | Type    | Required | Description                             |
|---------------|---------|----------|-----------------------------------------|
| `currency_id` | integer | Yes      | ID from the gateway's `currencies` list |
| `amount`      | decimal | Yes      | Deposit amount (must be > 0)            |

#### Response `data.type` values

| `type`       | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `redirect`   | Open `redirect_url` in an in-app browser / WebView to complete payment      |
| `form_post`  | Submit `val` as a form to `url` using `method` (e.g. PayPal)               |
| `stripe_v3`  | Use the Stripe.js SDK with `session_id` to confirm the payment              |
| `manual`     | No external URL — user must submit payment proof via the manual deposit flow |

#### Response `201` — Redirect gateway (e.g. Instamojo, Coingate)
```json
{
  "status": "success",
  "message": "Deposit initiated.",
  "data": {
    "type": "redirect",
    "redirect_url": "https://checkout.gateway.com/pay/abc123",
    "deposit": {
      "id": 11,
      "trx": "DEP20240601UVWX",
      "amount": 1000.00,
      "charge": 25.00,
      "rate": 1,
      "final_amo": 1025.00,
      "status": 0
    },
    "gateway": {
      "id": 1,
      "name": "Coingate",
      "code": 505
    },
    "currency": {
      "id": 3,
      "currency": "USD",
      "symbol": "$",
      "min_amount": 10.00,
      "max_amount": 10000.00
    }
  }
}
```

#### Response `201` — Form-post gateway (e.g. PayPal)
```json
{
  "status": "success",
  "message": "Deposit initiated.",
  "data": {
    "type": "form_post",
    "url": "https://www.paypal.com/cgi-bin/webscr",
    "method": "post",
    "val": {
      "cmd": "_xclick",
      "business": "merchant@example.com",
      "amount": "1025.00",
      "currency_code": "USD",
      "item_name": "Payment To MySite Account",
      "custom": "DEP20240601UVWX",
      "return": "https://yourdomain.com/deposit/success",
      "cancel_return": "https://yourdomain.com/deposit/cancel",
      "notify_url": "https://yourdomain.com/ipn/Paypal"
    },
    "deposit": { "id": 11, "trx": "DEP20240601UVWX", "amount": 1000.00, "charge": 25.00, "rate": 1, "final_amo": 1025.00, "status": 0 },
    "gateway": { "id": 2, "name": "PayPal", "code": 100 },
    "currency": { "id": 4, "currency": "USD", "symbol": "$", "min_amount": 5.00, "max_amount": 5000.00 }
  }
}
```

#### Response `201` — Stripe V3
```json
{
  "status": "success",
  "message": "Deposit initiated.",
  "data": {
    "type": "stripe_v3",
    "session_id": "cs_test_abc123xyz",
    "deposit": { "id": 11, "trx": "DEP20240601UVWX", "amount": 1000.00, "charge": 25.00, "rate": 1, "final_amo": 1025.00, "status": 0 },
    "gateway": { "id": 3, "name": "Stripe V3", "code": 200 },
    "currency": { "id": 5, "currency": "USD", "symbol": "$", "min_amount": 1.00, "max_amount": 10000.00 }
  }
}
```

#### Response `201` — Manual gateway
```json
{
  "status": "success",
  "message": "Deposit initiated. Submit your payment proof to complete.",
  "data": {
    "type": "manual",
    "deposit": { "id": 11, "trx": "DEP20240601UVWX", "amount": 1000.00, "charge": 25.00, "rate": 1, "final_amo": 1025.00, "status": 0 },
    "gateway": { "id": 4, "name": "Bank Transfer", "code": 1001 },
    "currency": { "id": 6, "currency": "PHP", "symbol": "₱", "min_amount": 100.00, "max_amount": 100000.00 }
  }
}
```

#### Response `422` — Amount out of range
```json
{
  "status": "error",
  "message": "Amount must be between 100 and 100000."
}
```

#### Response `422` — Gateway processing error
```json
{
  "status": "error",
  "message": "Unable to create payment session. Please try again."
}
```

---

### Confirm App Payment

Retrieves a pending deposit for review. Used after the user completes payment in the gateway's external flow to confirm it in the app.

**POST** `/api/app/payment/confirm`

#### Request Body

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `trx`     | string | Yes      | Deposit transaction reference |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 11,
    "trx": "DEP20240601UVWX",
    "amount": 1000.00,
    "charge": 25.00,
    "final_amo": 1025.00,
    "status": 0,
    "gateway": {
      "id": 1,
      "name": "PayMongo"
    }
  }
}
```

---

## Cart

All endpoints require authentication.

---

### Get Cart

Returns all items in the authenticated user's cart with a subtotal.

**GET** `/api/cart`

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 10,
        "user_id": 42,
        "product_id": 7,
        "quantity": 2,
        "product": {
          "id": 7,
          "name": "Wireless Keyboard",
          "price": 899.00,
          "image": "products/kbd.jpg"
        }
      }
    ],
    "subtotal": 1798.00,
    "count": 1
  }
}
```

---

### Add to Cart

Adds a product to the cart. If the product is already in the cart, the quantities are combined.

**POST** `/api/cart`

#### Request Body

| Parameter    | Type    | Required | Rules                             |
|--------------|---------|----------|-----------------------------------|
| `product_id` | integer | Yes      | Must exist in `products` table    |
| `quantity`   | integer | Yes      | min:1                             |

#### Response `201`
```json
{
  "status": "success",
  "message": "Item added to cart.",
  "data": {
    "id": 10,
    "user_id": 42,
    "product_id": 7,
    "quantity": 2,
    "product": {
      "id": 7,
      "name": "Wireless Keyboard",
      "price": 899.00
    }
  }
}
```

#### Response `422` — Out of stock
```json
{
  "status": "error",
  "message": "Only 1 item(s) available in stock."
}
```

---

### Update Cart Item

Sets the quantity of an existing cart item.

**POST** `/api/cart/update`

#### Request Body

| Parameter  | Type    | Required | Rules          |
|------------|---------|----------|----------------|
| `cart_id`  | integer | Yes      | Existing cart item ID |
| `quantity` | integer | Yes      | min:1          |

#### Response `200`
```json
{
  "status": "success",
  "message": "Cart updated.",
  "data": {
    "id": 10,
    "quantity": 3,
    "product": { }
  }
}
```

#### Response `422` — Stock exceeded
```json
{
  "status": "error",
  "message": "Only 2 item(s) available."
}
```

---

### Remove Cart Item

Removes a single item from the cart.

**DELETE** `/api/cart/remove/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description   |
|-----------|---------|----------|---------------|
| `id`      | integer | Yes      | Cart item ID  |

#### Response `200`
```json
{
  "status": "success",
  "message": "Item removed from cart."
}
```

---

### Clear Cart

Deletes all items from the authenticated user's cart.

**POST** `/api/cart/delete`

#### Response `200`
```json
{
  "status": "success",
  "message": "Cart cleared."
}
```

---

### Apply Voucher

Validates a promo code and returns the discount amount and updated totals. Does **not** apply the voucher to an order — pass `voucher_id` to [Place Order](#place-order) to redeem it.

**POST** `/api/cart/apply-voucher`

#### Request Body

| Parameter    | Type   | Required | Description       |
|--------------|--------|----------|-------------------|
| `promo_code` | string | Yes      | Voucher/promo code|

#### Response `200`
```json
{
  "status": "success",
  "message": "Voucher applied.",
  "data": {
    "voucher_id": 3,
    "voucher_name": "SUMMER10",
    "discount": 179.80,
    "cart_total": 1798.00,
    "final_total": 1618.20
  }
}
```

| Field         | Type    | Description                                  |
|---------------|---------|----------------------------------------------|
| `voucher_id`  | integer | Pass this to `place-order` as `voucher_id`   |
| `discount`    | decimal | Calculated discount amount                   |
| `final_total` | decimal | Cart total after discount (never below 0)    |

#### Response `422` — Invalid, expired, or exhausted voucher
```json
{
  "status": "error",
  "message": "Voucher code has expired."
}
```

---

## Checkout

All endpoints require authentication.

---

### Get Checkout Summary

Returns the cart items, subtotal, and relevant user fields needed on the checkout screen.

**GET** `/api/checkout`

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "cart": [
      {
        "id": 10,
        "product_id": 7,
        "quantity": 2,
        "product": {
          "id": 7,
          "name": "Wireless Keyboard",
          "price": 899.00
        }
      }
    ],
    "subtotal": 1798.00,
    "user": {
      "id": 42,
      "firstname": "Juan",
      "lastname": "Dela Cruz",
      "email": "juan@example.com",
      "mobile": "09171234567",
      "address": {
        "address": "123 Main St",
        "city": "Manila",
        "state": "Metro Manila",
        "zip": "1000",
        "country": "Philippines"
      },
      "sw_balance": 5000.00
    }
  }
}
```

#### Response `422` — Empty cart
```json
{
  "status": "error",
  "message": "Your cart is empty."
}
```

---

### Get Shipment Cost (Checkout)

Looks up the shipping fee for the delivery address entered at checkout.

**POST** `/api/checkout/shipment-cost`

#### Request Body

| Parameter  | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `region`   | string | Yes      | Region code or name      |
| `province` | string | No       | Province code or name    |
| `city`     | string | No       | City/municipality        |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "base_cost": 150.00
  }
}
```

---

### Place Order

Submits the order. Deducts the full amount from the user's `sw_balance` (OLPay wallet) after verifying the OLPIN. Clears the cart on success.

**POST** `/api/checkout/place-order`

#### Request Body

| Parameter        | Type    | Required | Rules                         |
|------------------|---------|----------|-------------------------------|
| `fullname`       | string  | Yes      | max:191                       |
| `phone`          | string  | Yes      | max:30                        |
| `email`          | string  | Yes      | Valid email, max:191          |
| `region`         | string  | Yes      | Delivery region               |
| `province`       | string  | Yes      | Delivery province             |
| `city`           | string  | Yes      | Delivery city                 |
| `payment_method` | string  | Yes      | Must be `"olpay"`             |
| `pin`            | string  | Yes      | User's OLPIN                  |
| `voucher_id`     | integer | No       | ID from apply-voucher response|

#### Response `201`
```json
{
  "status": "success",
  "message": "Order placed successfully.",
  "data": {
    "trx": "ORD20240601MNOP",
    "total_paid": 1948.00,
    "orders": [
      {
        "id": 101,
        "user_id": 42,
        "product_id": 7,
        "quantity": 2,
        "price": 899.00,
        "total_price": 1798.00,
        "trx": "ORD20240601MNOP",
        "status": 0,
        "shipcost": 150.00,
        "delivery_info": {
          "fullname": "Juan Dela Cruz",
          "phone": "09171234567",
          "email": "juan@example.com",
          "region": "NCR",
          "province": "Metro Manila",
          "city": "Manila"
        },
        "product": {
          "id": 7,
          "name": "Sample Product",
          "price": 899.00,
          "quantity": 98,
          "plan_id": 0
        }
      }
    ]
  }
}
```

#### Response `422` — Insufficient balance
```json
{
  "status": "error",
  "message": "Insufficient balance to complete the order."
}
```

#### Response `422` — Wrong OLPIN
```json
{
  "status": "error",
  "message": "Invalid OLPIN. Please try again."
}
```

---

## Orders

All endpoints require authentication.

---

### List Orders

Returns a paginated list of the authenticated user's orders.

**GET** `/api/orders`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 101,
        "product_id": 7,
        "quantity": 2,
        "price": 899.00,
        "total_price": 1798.00,
        "trx": "ORD20240601MNOP",
        "status": 0,
        "shipcost": 150.00,
        "rating": null,
        "comment": null,
        "delivery_info": {
          "fullname": "Juan Dela Cruz",
          "city": "Manila"
        },
        "product": {
          "id": 7,
          "name": "Wireless Keyboard",
          "image": "products/kbd.jpg"
        }
      }
    ],
    "total": 8,
    "per_page": 15
  }
}
```

---

### Order Details

Returns a single order by ID.

**GET** `/api/orders/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Order ID    |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 101,
    "quantity": 2,
    "price": 899.00,
    "total_price": 1798.00,
    "trx": "ORD20240601MNOP",
    "status": 0,
    "shipcost": 150.00,
    "rating": null,
    "comment": null,
    "delivery_info": { },
    "product": { }
  }
}
```

---

### Cancel Order

Cancels a pending order. Only orders with `status=0` (pending) can be cancelled.

**POST** `/api/orders/cancel/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Order ID    |

#### Response `200`
```json
{
  "status": "success",
  "message": "Order cancelled successfully."
}
```

#### Response `422` — Cannot cancel
```json
{
  "status": "error",
  "message": "Only pending orders can be cancelled."
}
```

---

### Rate Order

Submits a star rating and optional comment for a delivered order. Only orders with `status=1` (delivered) can be rated.

**POST** `/api/orders/rating/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Order ID    |

#### Request Body

| Parameter | Type    | Required | Rules              |
|-----------|---------|----------|--------------------|
| `rating`  | integer | Yes      | 1 to 5             |
| `comment` | string  | No       | max:500            |

#### Response `200`
```json
{
  "status": "success",
  "message": "Rating submitted successfully."
}
```

#### Response `422` — Not delivered
```json
{
  "status": "error",
  "message": "Only delivered orders can be rated."
}
```

---

## Support Tickets

All endpoints require authentication.

---

### List Tickets

Returns a paginated list of support tickets created by the authenticated user.

**GET** `/api/ticket`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 5,
        "ticket": "847239",
        "subject": "Damaged item received",
        "status": 0,
        "priority": 2,
        "last_reply": "2024-06-01T12:00:00.000000Z"
      }
    ],
    "total": 3,
    "per_page": 15
  }
}
```

---

### Create Ticket

Opens a new support ticket with an initial message.

**POST** `/api/ticket/create`

#### Request Body

| Parameter  | Type    | Required | Rules                         |
|------------|---------|----------|-------------------------------|
| `name`     | string  | Yes      | max:191                       |
| `email`    | string  | Yes      | Valid email, max:191          |
| `subject`  | string  | Yes      | max:100                       |
| `message`  | string  | Yes      | The initial message body      |
| `priority` | integer | Yes      | `1` = Low, `2` = Medium, `3` = High |

#### Response `201`
```json
{
  "status": "success",
  "message": "Support ticket created.",
  "data": {
    "id": 5,
    "ticket": "847239",
    "subject": "Damaged item received",
    "status": 0,
    "priority": 2,
    "last_reply": "2024-06-01T12:00:00.000000Z",
    "message": [
      {
        "id": 12,
        "supportticket_id": 5,
        "message": "I received a damaged keyboard.",
        "created_at": "2024-06-01T12:00:00.000000Z"
      }
    ]
  }
}
```

---

### View Ticket

Returns a ticket and all of its messages by ticket number (not ID).

**GET** `/api/ticket/view/{ticket}`

#### Path Parameters

| Parameter | Type   | Required | Description                       |
|-----------|--------|----------|-----------------------------------|
| `ticket`  | string | Yes      | 6-digit ticket number (e.g. `847239`) |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "ticket": "847239",
    "subject": "Damaged item received",
    "status": 0,
    "priority": 2,
    "messages": [
      {
        "id": 12,
        "supportticket_id": 5,
        "message": "I received a damaged keyboard.",
        "admin_id": null,
        "created_at": "2024-06-01T12:00:00.000000Z"
      },
      {
        "id": 13,
        "supportticket_id": 5,
        "message": "We have arranged a replacement.",
        "admin_id": 1,
        "created_at": "2024-06-01T13:00:00.000000Z"
      }
    ]
  }
}
```

> Messages with `admin_id = null` are from the user; messages with a non-null `admin_id` are from support staff.

---

### Reply to Ticket

Adds a new message to an existing open ticket.

**POST** `/api/ticket/reply/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Ticket database ID (not the ticket number) |

#### Request Body

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `message` | string | Yes      | Reply message body    |

#### Response `201`
```json
{
  "status": "success",
  "message": "Reply sent.",
  "data": {
    "id": 14,
    "supportticket_id": 5,
    "message": "Thank you, I will wait for the replacement.",
    "admin_id": null,
    "created_at": "2024-06-01T14:00:00.000000Z"
  }
}
```

#### Response `422` — Ticket is closed
```json
{
  "status": "error",
  "message": "Ticket is closed and cannot receive replies."
}
```

---

### Close Ticket

Marks a ticket as closed. Closed tickets cannot receive further replies.

**POST** `/api/ticket/close/{id}`

#### Path Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `id`      | integer | Yes      | Ticket database ID |

#### Response `200`
```json
{
  "status": "success",
  "message": "Ticket closed."
}
```

---

## Plans

All endpoints require authentication.

---

### List Plans

Returns all active, non-deleted subscription plans available for purchase.

**GET** `/api/plans`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Silver",
      "price": 1500.00,
      "bv": 150,
      "type": 2,
      "tree_com": 50.00,
      "tree_com_limit": 5,
      "indirectref_com": 0,
      "prerequisites": null,
      "status": 1
    }
  ]
}
```

| Field             | Type    | Description                                               |
|-------------------|---------|-----------------------------------------------------------|
| `price`           | decimal | Plan cost deducted from registration wallet (`m_balance`) |
| `bv`              | integer | Business Volume credited on purchase                      |
| `type`            | integer | `1` = Package plan (use packages endpoint), `2` = Regular plan |
| `tree_com`        | decimal | Binary tree commission amount distributed up the tree     |
| `tree_com_limit`  | integer | Maximum levels for tree commission propagation            |
| `indirectref_com` | decimal | Indirect referral commission amount (`0` = disabled)      |
| `prerequisites`   | array   | List of plan IDs that must be subscribed to first         |

---

### Subscribe to a Plan

Purchases a plan and deducts the cost from the user's registration wallet (`m_balance`). Triggers BV, tree commission, and referral commission distributions automatically.

**POST** `/api/plans/subscribe`

#### Request Body

| Parameter | Type    | Required | Description                                 |
|-----------|---------|----------|---------------------------------------------|
| `plan_id` | integer | Yes      | ID of the plan to subscribe to              |
| `voucher` | string  | No       | Promo/voucher code for a discount           |

#### Response `201` — Subscription successful
```json
{
  "status": "success",
  "message": "Subscribed to Silver successfully.",
  "data": {
    "plan": {
      "id": 1,
      "name": "Silver",
      "price": 1500.00
    },
    "trx": "TRX20240601ABCD",
    "amount": "1500.00",
    "post_balance": "3500.00",
    "currency": "PHP"
  }
}
```

| Field          | Type   | Description                                           |
|----------------|--------|-------------------------------------------------------|
| `trx`          | string | Unique transaction reference number                   |
| `amount`       | string | Amount deducted (after any voucher discount)          |
| `post_balance` | string | Remaining `m_balance` after the purchase              |

#### Response `422` — Insufficient balance
```json
{
  "status": "error",
  "message": "Insufficient registration wallet balance."
}
```

#### Response `422` — Missing prerequisite
```json
{
  "status": "error",
  "message": "You must subscribe to the Bronze package first."
}
```

#### Response `422` — Invalid voucher
```json
{
  "status": "error",
  "message": "Invalid voucher code. Please try again."
}
```

#### Response `422` — Expired voucher
```json
{
  "status": "error",
  "message": "Voucher code has expired."
}
```

#### Response `422` — Package-type plan
```json
{
  "status": "error",
  "message": "This plan requires a package purchase. Please use the packages endpoint."
}
```

---

### BV Log

Returns the authenticated user's Business Volume (BV) log entries. Supports optional filtering by BV type.

**GET** `/api/plans/bv-log`

#### Query Parameters

| Parameter | Type   | Required | Description                                              |
|-----------|--------|----------|----------------------------------------------------------|
| `type`    | string | No       | Filter: `leftBV`, `rightBV`, `cutBV`, `paid`, or omit for all |
| `page`    | integer| No       | Page number                                              |

#### `type` Values

| Value    | Description                                      |
|----------|--------------------------------------------------|
| `leftBV` | Credits on the left binary leg                   |
| `rightBV`| Credits on the right binary leg                  |
| `cutBV`  | Deducted / cut BV entries                        |
| `paid`   | All credited (paid) BV entries across both legs  |
| *(omit)* | All BV entries (credits and debits)              |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 20,
        "user_id": 42,
        "amount": 150,
        "trx_type": "+",
        "position": 1,
        "details": "juandc subscribed to Silver plan.",
        "created_at": "2024-06-01T10:00:00.000000Z"
      }
    ],
    "total": 12,
    "per_page": 15,
    "last_page": 1
  }
}
```

| Field      | Type    | Description                                 |
|------------|---------|---------------------------------------------|
| `trx_type` | string  | `"+"` = credit, `"-"` = debit (cut)         |
| `position` | integer | `1` = left leg, `2` = right leg             |

---

### Binary Commission

Returns a paginated list of binary commission transactions earned by the authenticated user.

**GET** `/api/plans/binary-commission`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 201,
        "user_id": 42,
        "amount": 50.00,
        "trx_type": "+",
        "details": "Binary commission from cycle.",
        "remark": "binary_commission",
        "trx": "BIN20240601EFGH",
        "post_balance": 5050.00,
        "created_at": "2024-06-01T11:00:00.000000Z"
      }
    ],
    "total": 5,
    "per_page": 15,
    "last_page": 1
  }
}
```

---

### Binary Summary (Group Sales)

Returns the authenticated user's group sales summary, showing accumulated sales volume per leg.

**GET** `/api/plans/binary-summary`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "user_id": 42,
      "plan_id": 1,
      "left_count": 12,
      "right_count": 8,
      "left_bv": 1800,
      "right_bv": 1200,
      "created_at": "2024-06-01T00:00:00.000000Z",
      "plan": {
        "id": 1,
        "name": "Silver"
      }
    }
  ]
}
```

| Field         | Type    | Description                                  |
|---------------|---------|----------------------------------------------|
| `left_count`  | integer | Number of members under the left binary leg  |
| `right_count` | integer | Number of members under the right binary leg |
| `left_bv`     | integer | Total BV accumulated on the left leg         |
| `right_bv`    | integer | Total BV accumulated on the right leg        |

---

### My Referral

Returns a paginated list of users who registered using the authenticated user's referral link.

**GET** `/api/plans/my-referral`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 55,
        "firstname": "Maria",
        "lastname": "Santos",
        "username": "mariasantos",
        "email": "maria@example.com",
        "plan_id": 0,
        "status": 1,
        "created_at": "2024-06-02T09:00:00.000000Z"
      }
    ],
    "total": 7,
    "per_page": 15,
    "last_page": 1
  }
}
```

---

## Plans

All endpoints require authentication.

---

### List Plans

Returns all active, non-deleted subscription plans available for purchase.

**GET** `/api/plans`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Silver",
      "price": 1500.00,
      "bv": 150,
      "type": 2,
      "tree_com": 50.00,
      "tree_com_limit": 5,
      "indirectref_com": 0,
      "prerequisites": null,
      "status": 1
    }
  ]
}
```

| Field             | Type    | Description                                               |
|-------------------|---------|-----------------------------------------------------------|
| `price`           | decimal | Plan cost deducted from registration wallet (`m_balance`) |
| `bv`              | integer | Business Volume credited on purchase                      |
| `type`            | integer | `1` = Package plan (use packages endpoint), `2` = Regular plan |
| `tree_com`        | decimal | Binary tree commission amount distributed up the tree     |
| `tree_com_limit`  | integer | Maximum levels for tree commission propagation            |
| `indirectref_com` | decimal | Indirect referral commission amount (`0` = disabled)      |
| `prerequisites`   | array   | List of plan IDs that must be subscribed to first         |

---

### Subscribe to a Plan

Purchases a plan and deducts the cost from the user's registration wallet (`m_balance`). Triggers BV, tree commission, and referral commission distributions automatically.

**POST** `/api/plans/subscribe`

#### Request Body

| Parameter | Type    | Required | Description                                 |
|-----------|---------|----------|---------------------------------------------|
| `plan_id` | integer | Yes      | ID of the plan to subscribe to              |
| `voucher` | string  | No       | Promo/voucher code for a discount           |

#### Response `201` — Subscription successful
```json
{
  "status": "success",
  "message": "Subscribed to Silver successfully.",
  "data": {
    "plan": {
      "id": 1,
      "name": "Silver",
      "price": 1500.00
    },
    "trx": "TRX20240601ABCD",
    "amount": "1500.00",
    "post_balance": "3500.00",
    "currency": "PHP"
  }
}
```

| Field          | Type   | Description                                           |
|----------------|--------|-------------------------------------------------------|
| `trx`          | string | Unique transaction reference number                   |
| `amount`       | string | Amount deducted (after any voucher discount)          |
| `post_balance` | string | Remaining `m_balance` after the purchase              |

#### Response `422` — Insufficient balance
```json
{
  "status": "error",
  "message": "Insufficient registration wallet balance."
}
```

#### Response `422` — Missing prerequisite
```json
{
  "status": "error",
  "message": "You must subscribe to the Bronze package first."
}
```

#### Response `422` — Invalid voucher
```json
{
  "status": "error",
  "message": "Invalid voucher code. Please try again."
}
```

#### Response `422` — Expired voucher
```json
{
  "status": "error",
  "message": "Voucher code has expired."
}
```

#### Response `422` — Package-type plan
```json
{
  "status": "error",
  "message": "This plan requires a package purchase. Please use the packages endpoint."
}
```

---

### BV Log

Returns the authenticated user's Business Volume (BV) log entries. Supports optional filtering by BV type.

**GET** `/api/plans/bv-log`

#### Query Parameters

| Parameter | Type    | Required | Description                                              |
|-----------|---------|----------|----------------------------------------------------------|
| `type`    | string  | No       | Filter: `leftBV`, `rightBV`, `cutBV`, `paid`, or omit for all |
| `page`    | integer | No       | Page number                                              |

#### `type` Values

| Value    | Description                                      |
|----------|--------------------------------------------------|
| `leftBV` | Credits on the left binary leg                   |
| `rightBV`| Credits on the right binary leg                  |
| `cutBV`  | Deducted / cut BV entries                        |
| `paid`   | All credited (paid) BV entries across both legs  |
| *(omit)* | All BV entries (credits and debits)              |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 20,
        "user_id": 42,
        "amount": 150,
        "trx_type": "+",
        "position": 1,
        "details": "juandc subscribed to Silver plan.",
        "created_at": "2024-06-01T10:00:00.000000Z"
      }
    ],
    "total": 12,
    "per_page": 15,
    "last_page": 1
  }
}
```

| Field      | Type    | Description                                 |
|------------|---------|---------------------------------------------|
| `trx_type` | string  | `"+"` = credit, `"-"` = debit (cut)         |
| `position` | integer | `1` = left leg, `2` = right leg             |

---

### Binary Commission

Returns a paginated list of binary commission transactions earned by the authenticated user.

**GET** `/api/plans/binary-commission`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 201,
        "user_id": 42,
        "amount": 50.00,
        "trx_type": "+",
        "details": "Binary commission from cycle.",
        "remark": "binary_commission",
        "trx": "BIN20240601EFGH",
        "post_balance": 5050.00,
        "created_at": "2024-06-01T11:00:00.000000Z"
      }
    ],
    "total": 5,
    "per_page": 15,
    "last_page": 1
  }
}
```

---

### Binary Summary (Group Sales)

Returns the authenticated user's group sales summary, showing accumulated sales volume per leg.

**GET** `/api/plans/binary-summary`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "user_id": 42,
      "plan_id": 1,
      "left_count": 12,
      "right_count": 8,
      "left_bv": 1800,
      "right_bv": 1200,
      "created_at": "2024-06-01T00:00:00.000000Z",
      "plan": {
        "id": 1,
        "name": "Silver"
      }
    }
  ]
}
```

| Field         | Type    | Description                                  |
|---------------|---------|----------------------------------------------|
| `left_count`  | integer | Number of members under the left binary leg  |
| `right_count` | integer | Number of members under the right binary leg |
| `left_bv`     | integer | Total BV accumulated on the left leg         |
| `right_bv`    | integer | Total BV accumulated on the right leg        |

---

### My Referral

Returns a paginated list of users who registered using the authenticated user's referral link.

**GET** `/api/plans/my-referral`

#### Query Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `page`    | integer | No       | Page number |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 55,
        "firstname": "Maria",
        "lastname": "Santos",
        "username": "mariasantos",
        "email": "maria@example.com",
        "plan_id": 0,
        "status": 1,
        "created_at": "2024-06-02T09:00:00.000000Z"
      }
    ],
    "total": 7,
    "per_page": 15,
    "last_page": 1
  }
}
```

---

---

## Balance Transfer

All endpoints require authentication.

---

### Transfer Info

Returns the list of active merchants and the transfer fee configuration used to calculate charges on balance transfers.

**GET** `/api/transfer/info`

#### Request Parameters
None.

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "merchants": [
      {
        "id": 1,
        "name": "OL Store",
        "discount_percentage": 10,
        "merchant_id": 7
      }
    ],
    "bal_trans_fixed_charge": 5.00,
    "bal_trans_per_charge": 1.5
  }
}
```

| Field                    | Type    | Description                                          |
|--------------------------|---------|------------------------------------------------------|
| `merchants`              | array   | List of active merchants available for transfer      |
| `bal_trans_fixed_charge` | decimal | Flat fee charged per transfer                        |
| `bal_trans_per_charge`   | decimal | Percentage fee charged on the transfer amount        |

---

### Cash Wallet Transfer

Transfers an amount from the authenticated user's cash wallet (`balance`) to another user. A fixed + percentage charge is deducted from the sender on top of the transferred amount.

**POST** `/api/transfer/balance`

#### Request Body

| Parameter  | Type    | Required | Description                                      |
|------------|---------|----------|--------------------------------------------------|
| `username` | string  | Yes      | Recipient's username or email address            |
| `amount`   | decimal | Yes      | Amount to transfer (must be > 0)                 |

#### Response `200`
```json
{
  "status": "success",
  "message": "Balance transferred successfully.",
  "data": {
    "trx": "TRX20240601ABCD",
    "amount": "500.00",
    "charge": "12.50",
    "post_balance": "987.50",
    "recipient": "mariasantos"
  }
}
```

| Field          | Type   | Description                                                        |
|----------------|--------|--------------------------------------------------------------------|
| `trx`          | string | Unique transaction reference                                       |
| `amount`       | string | Amount sent to recipient                                           |
| `charge`       | string | Total fee deducted from sender (`fixed_charge + amount * per_charge / 100`) |
| `post_balance` | string | Sender's cash wallet balance after the transfer                    |
| `recipient`    | string | Recipient's username                                               |

#### Response `422` — User not found
```json
{
  "status": "error",
  "message": "Username not found."
}
```

#### Response `422` — Self-transfer
```json
{
  "status": "error",
  "message": "Balance transfer not possible to your own account."
}
```

#### Response `422` — Insufficient balance
```json
{
  "status": "error",
  "message": "Insufficient balance."
}
```

---

### Registration Wallet Transfer

Transfers an amount from the authenticated user's registration wallet (`m_balance`) to another user's registration wallet. The same fixed + percentage charge structure applies.

**POST** `/api/transfer/registration`

#### Request Body

| Parameter  | Type    | Required | Description                                |
|------------|---------|----------|--------------------------------------------|
| `username` | string  | Yes      | Recipient's username or email address      |
| `amount`   | decimal | Yes      | Amount to transfer (must be > 0)           |

#### Response `200`
```json
{
  "status": "success",
  "message": "Registration wallet balance transferred successfully.",
  "data": {
    "trx": "TRX20240601EFGH",
    "amount": "300.00",
    "charge": "9.50",
    "post_balance": "1190.50",
    "recipient": "juandc"
  }
}
```

#### Response `422` — Errors
Same error structure as [Cash Wallet Transfer](#cash-wallet-transfer) (`username not found`, `self-transfer`, `insufficient balance`).

---

### Merchant Transfer

Transfers an amount from the authenticated user's shopping wallet (`sw_balance`) to a merchant. The merchant receives the amount minus a discount; the discount is distributed as unilevel earnings.

**POST** `/api/transfer/merchant`

#### Request Body

| Parameter     | Type    | Required | Description                                    |
|---------------|---------|----------|------------------------------------------------|
| `merchant_id` | integer | Yes      | ID of the merchant (from [Transfer Info](#transfer-info)) |
| `amount`      | decimal | Yes      | Amount to transfer from shopping wallet        |

#### Response `200`
```json
{
  "status": "success",
  "message": "Balance transferred to merchant successfully.",
  "data": {
    "trx": "TRX20240601IJKL",
    "amount": 1000.00,
    "merchant_received": 900.00,
    "discount_percentage": 10,
    "discount": 100.00,
    "post_balance": 4000.00,
    "merchant": "olstore"
  }
}
```

| Field                | Type    | Description                                                    |
|----------------------|---------|----------------------------------------------------------------|
| `amount`             | decimal | Full amount deducted from sender's shopping wallet             |
| `merchant_received`  | decimal | Amount credited to merchant's withdrawal wallet (`w_balance`)  |
| `discount_percentage`| integer | Merchant's configured discount rate                            |
| `discount`           | decimal | Discount amount distributed as unilevel earnings               |
| `post_balance`       | decimal | Sender's shopping wallet balance after the transfer            |

#### Response `422` — Merchant not found
```json
{
  "status": "error",
  "message": "Merchant not found."
}
```

#### Response `422` — Insufficient balance
```json
{
  "status": "error",
  "message": "Insufficient balance."
}
```

---

### Search User

Checks whether a user with the given username or email exists. Use this to validate the recipient before initiating a transfer.

**POST** `/api/transfer/search-user`

#### Request Body

| Parameter  | Type   | Required | Description                     |
|------------|--------|----------|---------------------------------|
| `username` | string | Yes      | Username or email to look up    |

#### Response `200`
```json
{
  "status": "success",
  "data": {
    "found": true
  }
}
```

| Field   | Type    | Description                              |
|---------|---------|------------------------------------------|
| `found` | boolean | `true` if the user exists, `false` if not|

---

## Enumerations & Status Codes

### Order Status

| Value | Meaning               |
|-------|-----------------------|
| `0`   | Pending               |
| `1`   | Delivered             |
| `2`   | Processing / Shipped  |
| `3`   | Returned              |
| `4`   | Cancelled             |

### Withdrawal Status

| Value | Meaning      |
|-------|--------------|
| `0`   | Pending      |
| `1`   | Approved     |
| `2`   | Processing   |
| `3`   | Rejected     |

### Deposit Status

| Value | Meaning      |
|-------|--------------|
| `0`   | Pending      |
| `1`   | Approved     |
| `2`   | Cancelled    |
| `3`   | Rejected     |

### Ticket Priority

| Value | Meaning |
|-------|---------|
| `1`   | Low     |
| `2`   | Medium  |
| `3`   | High    |

### Ticket Status

| Value | Meaning        |
|-------|----------------|
| `0`   | Open           |
| `1`   | Answered       |
| `2`   | Closed         |

### User Flags

| Field | Value | Meaning                          |
|-------|-------|----------------------------------|
| `ev`  | `0`   | Email not verified               |
| `ev`  | `1`   | Email verified                   |
| `sv`  | `0`   | Phone not verified               |
| `sv`  | `1`   | Phone verified                   |
| `ts`  | `1`   | Two-factor via SMS is enabled    |
| `tv`  | `1`   | Two-factor via Google Auth is enabled |
| `status` | `1` | Account active                 |
| `status` | `0` | Account disabled               |

---

*Generated for OLMarketplace Flutter Mobile App — all endpoints match the `app/Http/Controllers/Api/` source code.*
