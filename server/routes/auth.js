import express from 'express';
import { googleLogin } from '../controller/auth.js';

const auth = express.Router();

auth.post('/google', googleLogin);

export default auth;
