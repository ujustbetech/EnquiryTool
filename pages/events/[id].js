import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import Swal from "sweetalert2";

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bhk: "",
    subcategory: "",
    comment: "",
  });

  const [errors, setErrors] = useState({});
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const enquiryType = "Packers & Movers";

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchRegisteredUserCount();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    const eventRef = doc(db, "Enquiry", id);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      setEventDetails(eventDoc.data());
    }
    setLoading(false);
  };

  const fetchRegisteredUserCount = async () => {
    const registeredUsersRef = collection(
      db,
      "Enquiry",
      id,
      "registeredUsers"
    );
    const snapshot = await getDocs(registeredUsersRef);
    setRegisteredUserCount(snapshot.size);
  };

  // ---------------- VALIDATION ----------------

  const validateField = (name, value) => {
    let message = "";

    if (name === "name" && !value.trim())
      message = "Full name is required";

    if (name === "phone") {
      if (!value) message = "Phone number is required";
      else if (!/^[0-9]{10}$/.test(value))
        message = "Enter valid 10 digit phone number";
    }

    if (name === "bhk" && !value)
      message = "Please select BHK";

    if (name === "subcategory" && !value)
      message = "Please select subcategory";

    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const results = [
      validateField("name", formData.name),
      validateField("phone", formData.phone),
      validateField("bhk", formData.bhk),
      validateField("subcategory", formData.subcategory),
    ];
    return results.every((item) => item === true);
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userRef = doc(
        db,
        "Enquiry",
        id,
        "registeredUsers",
        formData.phone
      );

      const existingUser = await getDoc(userRef);

      if (existingUser.exists()) {
        Swal.fire({
          icon: "info",
          title: "Already Registered",
          text: "This phone number is already registered.",
          confirmButtonColor: "#16274f",
        });
        return;
      }

      await setDoc(userRef, {
        name: formData.name,
        phoneNumber: formData.phone,
        bhk: formData.bhk,
        enquiryType,
        subcategory: formData.subcategory,
        comment: formData.comment,
        registeredAt: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        confirmButtonColor: "#16274f",
      });

      setFormData({
        name: "",
        phone: "",
        bhk: "",
        subcategory: "",
        comment: "",
      });

      setErrors({});
      fetchRegisteredUserCount();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong.",
      });
    }
  };

  if (loading) return <div style={{ padding: 50 }}>Loading...</div>;

  const formattedDate = eventDetails?.startDate?.seconds
    ? format(
        new Date(eventDetails.startDate.seconds * 1000),
        "EEEE, dd/MM/yyyy"
      )
    : "";

  return (
    <section className="feedbackContainer">
      <div className="feedback-form-container">

        <h2 className="feedback-form-title">
          {eventDetails?.eventName || "Event"}
        </h2>

        {formattedDate && (
          <div className="event-card">{formattedDate}</div>
        )}

        <div className="count-badge">
          {registeredUserCount} people registered
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="input-group">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.name ? "error-input" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="input-group">
            <label>Contact Number</label>
            <input
              name="phone"
              maxLength="10"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.phone ? "error-input" : ""}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="input-group">
            <label>BHK</label>
            <select
              name="bhk"
              value={formData.bhk}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.bhk ? "error-input" : ""}
            >
              <option value="">Select BHK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
            </select>
            {errors.bhk && (
              <span className="error-message">{errors.bhk}</span>
            )}
          </div>

          <div className="input-group">
            <label>Subcategory</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.subcategory ? "error-input" : ""}
            >
              <option value="">Select Subcategory</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            {errors.subcategory && (
              <span className="error-message">{errors.subcategory}</span>
            )}
          </div>

          <div className="input-group">
            <label>Comment</label>
            <textarea
              name="comment"
              rows="3"
              value={formData.comment}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Enquiry Type</label>
            <input value={enquiryType} disabled readOnly />
          </div>

          <button className="submitbtns">
            Submit Registration
          </button>

        </form>

      </div>
    </section>
  );
};

export default EventLoginPage;
