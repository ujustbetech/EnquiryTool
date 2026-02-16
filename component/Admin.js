import { useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from 'qrcode';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    if (!eventName || !startDate) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const eventRef = collection(db, 'Enquiry');
      const uniqueId = doc(eventRef).id;
      const eventDocRef = doc(eventRef, uniqueId);

      await setDoc(eventDocRef, {
        eventName: eventName,
        startDate: Timestamp.fromDate(new Date(startDate)),
        uniqueId: uniqueId,
        createdAt: Timestamp.now()
      });

      const eventLink = `${window.location.origin}/events/${uniqueId}`;
      const qrImageData = await QRCode.toDataURL(eventLink);

      const qrRef = ref(storage, `qrcodes/${uniqueId}.png`);
      await uploadString(qrRef, qrImageData, 'data_url');

      const qrDownloadUrl = await getDownloadURL(qrRef);

      await setDoc(eventDocRef, {
        qrCodeUrl: qrDownloadUrl,
      }, { merge: true });

      setSuccess('Event created successfully!');

      setEventName('');
      setStartDate('');
      setLoading(false);

      router.push(`/events/${uniqueId}`);

    } catch (error) {
      console.error(error);
      setError('Error creating event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className='c-form box'>
      <h2>Create New Event</h2>

      <form onSubmit={handleCreateEvent}>
        <ul>

          {/* ✅ Event Name Text Input */}
          <li className='form-row'>
            <h4>Event Name<sup>*</sup></h4>
            <div className='multipleitem'>
              <input
                type="text"
                placeholder="Enter Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>
          </li>

          {/* ✅ Only Start Date */}
          <li className='form-row'>
            <h4>Start Date<sup>*</sup></h4>
            <div className='multipleitem'>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </li>

          <li className='form-row'>
            <div>
              <button className='submitbtn' type='submit' disabled={loading}>
                {loading ? 'Creating...' : 'Submit'}
              </button>
            </div>
          </li>

        </ul>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {loading && (
        <div className='loader'>
          <span className="loader2"></span>
        </div>
      )}
    </section>
  );
};

export default CreateEvent;
