import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';

const EditEvent = () => {
  const router = useRouter();
  const { id } = router.query;

  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const eventDocRef = doc(db, 'Enquiry', id);
        const eventSnapshot = await getDoc(eventDocRef);

        if (eventSnapshot.exists()) {
          const data = eventSnapshot.data();

          setEventName(data.eventName || '');

          setStartDate(
            data.startDate
              ? new Date(data.startDate.seconds * 1000)
                  .toISOString()
                  .slice(0, 10) // date only
              : ''
          );
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventName || !startDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const eventDocRef = doc(db, 'Enquiry', id);

      await updateDoc(eventDocRef, {
        eventName: eventName,
        startDate: Timestamp.fromDate(new Date(startDate)),
      });

      setSuccess('Event updated successfully!');

      setTimeout(() => {
        router.push('/admin/event/manageEvent');
      }, 1000);

    } catch (err) {
      console.error(err);
      setError('Error updating event. Please try again.');
    }
  };

  return (
    <Layout>
      <section className='c-form box'>
        <h2>Edit Event</h2>

        <button
          className="m-button-5"
          onClick={() => window.history.back()}
        >
          Back
        </button>

        {loading ? (
          <p>Loading event details...</p>
        ) : (
          <form onSubmit={handleUpdateEvent}>
            <ul>

              <li className='form-row'>
                <h4>Event Name *</h4>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Start Date *</h4>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </li>

              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}

              <li className='form-row'>
                <div>
                  <button className='submitbtn' type='submit'>
                    Update
                  </button>
                </div>
              </li>

            </ul>
          </form>
        )}
      </section>
    </Layout>
  );
};

export default EditEvent;
