# SKILL: Smart Fix-It POC

## Project Overview
**Smart Fix-It** is an intelligent, dynamic maintenance-request experience for UC San Diego. It serves as a "better front door" for maintenance requests, utilizing guided intake and AI to structure user input before it ever reaches the system of record.

### Core Purpose
To transition the user experience from "filling out an enterprise form" to "explaining a problem to a helpful assistant."

**Crucial Constraint:** Smart Fix-It is **not** a replacement for Maximo. Maximo remains the system of record for all operational maintenance data.

---

## Visual Design Direction
**Aesthetic Goal:** "UC San Diego + Modern Consumer-Quality Digital Service."

### Design Principles
- **Editorial Sophistication:** Inspired by a "morning brief" style—strong typography and generous whitespace.
- **Dynamic Single Page:** A fluid, single-page experience where sections reveal themselves progressively based on user input.
- **Approachable Structure:** Use of cards, chips, and a calm visual rhythm to reduce cognitive load.

### Visual Design Tokens
| Token | Value / Direction |
| :--- | :--- |
| `color-primary` | UCSD Navy |
| `color-secondary` | UCSD Gold |
| `color-bg` | Off-White / Very Light Grey |
| `color-surface` | Pure White |
| `radius-lg` | 20px |
| `shadow-sm` | Soft, diffused blur |

---

## User Experience & Dynamic Flow

### Flow Sequence (Single Page Progressive Reveal)
The interface reveals sections in this specific order:

1. **Requester Identity**
   - Affiliation (Student, Staff, etc.)
2. **Space Type**
   - Common categories (Residential, Office, etc.)
   - Optional "Specific Space" text box for custom descriptions.
3. **Location Discovery**
   - Searchable building/landmark hierarchy.
4. **Relationship to Space**
   - "What's your connection to this location?" (I live here, I work here, etc.)
5. **Natural Language Problem Intake**
   - "What's going on?" free-text + photos.
6. **AI Interpretation & Detailing**
   - AI identifies issue $\rightarrow$ User confirms $\rightarrow$ Dynamic follow-up questions.
   - Includes a "Bypass" option for raw text submission.
7. **Urgency Level**
   - **Immediate/Serious:** "Needs to be fixed immediately; seriously impacting me or the space."
   - **Standard:** "Needs attention, but not an emergency."
   - **Minor/Low:** "Not urgent (e.g., one light out but others work)."
8. **Contextual Access**
   - Questions based on Space Type (e.g., "Can maintenance enter?").
9. **Review & Submission**
   - Final summary $\rightarrow$ Submission $\rightarrow$ Status Timeline.

---

## Technical Strategy & Architecture

### AI & Logic Services
- **AI Interpretation:** Simulated pattern matching for issues, multi-issue detection, and diversion (e.g., lockouts).
- **Location Service:** Authoritative public UCSD knowledge separated from mock Maximo IDs.
- **Request Service:** Handles duplicate detection and simulated submission to `dfrailey@ucsd.edu`.

### POC Scope: Supported Issue Types
- Plumbing / Sink Leak, HVAC / No Cooling, Electrical / Flickering Light, Electronic Lock Failure, Forgotten-key Lockout (Diversion), Building Repair, Laundry/Appliance.

---

## Guardrails
1. **Data Distinction:** Clear line between public UCSD location data and mock Maximo operational data.
2. **No False Authority:** Dummy records and simulated AI are clearly labeled as POC placeholders.
