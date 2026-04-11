import { Router } from 'express';

const router = Router();

// Mock endpoints for Auth
router.post('/login', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { name: 'John Doe', email: 'john@example.com' } });
});

router.post('/signup', (req, res) => {
  res.json({ message: 'User registered successfully, pending OTP verification' });
});

router.post('/verify-otp', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { name: 'New User' } });
});

export default router;
