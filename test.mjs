import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8080/api' });

async function run() {
  try {
    const ts = Date.now();
    const userA = 'usera_' + ts;
    const userB = 'userb_' + ts;
    await api.post('/auth/register', { username: userA, email: userA+'@gmail.com', password: 'Password1!', fullName: 'User A' });
    await api.post('/auth/register', { username: userB, email: userB+'@gmail.com', password: 'Password1!', fullName: 'User B' });
    
    const resA = await api.post('/auth/login', { username: userA, password: 'Password1!' });
    const tokenA = resA.data.data.accessToken;
    
    console.log('Follow user B...');
    const followRes = await api.post('/users/' + userB + '/follow', {}, { headers: { Authorization: 'Bearer ' + tokenA } });
    console.log('Follow result:', followRes.data);
    
    console.log('Unfollow user B...');
    const unfollowRes = await api.delete('/users/' + userB + '/follow', { headers: { Authorization: 'Bearer ' + tokenA } });
    console.log('Unfollow result:', unfollowRes.data);
  } catch (e) {
    console.error('ERROR:', e.response ? e.response.data : e.message);
  }
}
run();
