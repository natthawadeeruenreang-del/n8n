{
  "name": "RoomBooking",
  "type": "object",
  "properties": {
    "booker_name": {
      "type": "string",
      "description": "\u0e0a\u0e37\u0e48\u0e2d-\u0e2a\u0e01\u0e38\u0e25 \u0e1c\u0e39\u0e49\u0e08\u0e2d\u0e07"
    },
    "booker_role": {
      "type": "string",
      "enum": [
        "student",
        "teacher",
        "staff"
      ],
      "description": "\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e1c\u0e39\u0e49\u0e08\u0e2d\u0e07"
    },
    "student_id": {
      "type": "string",
      "description": "\u0e23\u0e2b\u0e31\u0e2a\u0e19\u0e34\u0e2a\u0e34\u0e15 8 \u0e2b\u0e25\u0e31\u0e01 (\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e19\u0e34\u0e2a\u0e34\u0e15)"
    },
    "booker_email": {
      "type": "string",
      "description": "Email \u0e1c\u0e39\u0e49\u0e08\u0e2d\u0e07 (\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e2d\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c/\u0e40\u0e08\u0e49\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48)"
    },
    "room": {
      "type": "string",
      "enum": [
        "MA103",
        "MA105",
        "MA106",
        "MA107",
        "MA208"
      ],
      "description": "\u0e2b\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e08\u0e2d\u0e07"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e08\u0e2d\u0e07"
    },
    "start_time": {
      "type": "string",
      "description": "\u0e40\u0e27\u0e25\u0e32\u0e40\u0e23\u0e34\u0e48\u0e21\u0e15\u0e49\u0e19"
    },
    "end_time": {
      "type": "string",
      "description": "\u0e40\u0e27\u0e25\u0e32\u0e2a\u0e34\u0e49\u0e19\u0e2a\u0e38\u0e14"
    },
    "purpose": {
      "type": "string",
      "description": "\u0e27\u0e31\u0e15\u0e16\u0e38\u0e1b\u0e23\u0e30\u0e2a\u0e07\u0e04\u0e4c\u0e01\u0e32\u0e23\u0e02\u0e2d\u0e43\u0e0a\u0e49\u0e2b\u0e49\u0e2d\u0e07"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ],
      "default": "approved",
      "description": "\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07"
    },
    "requires_approval": {
      "type": "boolean",
      "default": false,
      "description": "\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34\u0e08\u0e32\u0e01\u0e2d\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48"
    },
    "approved_by": {
      "type": "string",
      "description": "\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34\u0e42\u0e14\u0e22 (email \u0e2d\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c/\u0e40\u0e08\u0e49\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48)"
    },
    "approved_date": {
      "type": "string",
      "format": "date-time",
      "description": "\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34"
    }
  },
  "required": [
    "booker_name",
    "booker_role",
    "room",
    "date",
    "start_time",
    "end_time",
    "purpose"
  ]
}