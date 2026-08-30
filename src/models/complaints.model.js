import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Road",
        "Garbage",
        "Water",
        "Electricity",
        "Other",
      ],
      required: true,
    },

    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
latitude: {
  type: Number,
  default: null,
},

longitude: {
  type: Number,
  default: null,
},
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved",
      ],
      default: "Pending",
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    officerRemark: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    feedbackComment: {
      type: String,
      default: "",
    },

    feedbackGiven: {
      type: Boolean,
      default: false,
    },

    feedbackPending: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Complaint",
  complaintSchema
);