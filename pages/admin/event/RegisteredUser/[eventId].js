import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import ExportToExcel from '../../../admin/ExporttoExcel';

const RegisteredUsers = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bhk, setBhk] = useState('');
  const [comment, setComment] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const enquiryType = "Packers & Movers"; // default

  useEffect(() => {
    if (!eventId) return;

    const fetchRegisteredUsers = async () => {
      try {
        const registeredUsersCollection = collection(
          db,
          `Enquiry/${eventId}/registeredUsers`
        );

        const snapshot = await getDocs(registeredUsersCollection);

        const users = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            srNo: index + 1,
            name: data.name || 'N/A',
            phoneNumber: data.phoneNumber || 'N/A',
            bhk: data.bhk || 'N/A',
            comment: data.comment || 'N/A',
            enquiryType: data.enquiryType || 'N/A',
            subcategory: data.subcategory || 'N/A',
            registeredAt:
              data.registeredAt?.toDate().toLocaleString() || 'N/A',
          };
        });

        setRegisteredUsers(users);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch users.');
      }
    };

    fetchRegisteredUsers();
  }, [eventId, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter name.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError('Enter valid 10 digit phone number.');
      return;
    }

    if (!bhk) {
      setError('Please select BHK.');
      return;
    }

    if (!subcategory) {
      setError('Please select subcategory.');
      return;
    }

    try {
      const userRef = doc(
        db,
        'Enquiry',
        eventId,
        'registeredUsers',
        phoneNumber
      );

      await setDoc(userRef, {
        name,
        phoneNumber,
        bhk,
        comment,
        enquiryType,
        subcategory,
        registeredAt: Timestamp.now(),
      });

      setSuccess('User added successfully.');

      setName('');
      setPhoneNumber('');
      setBhk('');
      setComment('');
      setSubcategory('');

    } catch (err) {
      console.error(err);
      setError('Error submitting user.');
    }
  };

  return (
    <Layout>
      <section className='c-userslist box'>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3>Registered Users</h3>
          <ExportToExcel eventId={eventId} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {/* Admin Add Form */}
        <section className='c-form box'>
          <h2>Add New Lead</h2>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <ul>

              <li className='form-row'>
                <h4>Name *</h4>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Phone *</h4>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>BHK *</h4>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  required
                >
                  <option value="">Select BHK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                </select>
              </li>

              <li className='form-row'>
                <h4>Enquiry</h4>
                <input
                  type="text"
                  value={enquiryType}
                  disabled
                />
              </li>

              <li className='form-row'>
                <h4>Subcategory *</h4>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                >
                  <option value="">Select Subcategory</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </li>

              <li className='form-row'>
                <h4>Comment</h4>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                />
              </li>

              <li className='form-row'>
                <button type="submit" className="submitbtn">
                  Add User
                </button>
              </li>

            </ul>
          </form>
        </section>

        {/* Users Table */}
        <table className='table-class' style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>BHK</th>
              <th>Enquiry</th>
              <th>Subcategory</th>
              <th>Comment</th>
              <th>Registered At</th>
            </tr>
          </thead>

          <tbody>
            {registeredUsers.length > 0 ? (
              registeredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.srNo}</td>
                  <td>{user.name}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.bhk}</td>
                  <td>{user.enquiryType}</td>
                  <td>{user.subcategory}</td>
                  <td>{user.comment}</td>
                  <td>{user.registeredAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No users registered for this event.</td>
              </tr>
            )}
          </tbody>
        </table>

      </section>
    </Layout>
  );
};

export default RegisteredUsers;
