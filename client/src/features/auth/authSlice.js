import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

const STORAGE_KEY = 'rms_token'

export const login = createAsyncThunk('auth/login', async (values, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', values)
    localStorage.setItem(STORAGE_KEY, data.data.token)
    return data.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Unable to login')
  }
})

export const register = createAsyncThunk('auth/register', async (values, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', values)
    localStorage.setItem(STORAGE_KEY, data.data.token)
    return data.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Unable to register')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data.data.user
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY)
    return rejectWithValue(e.response?.data?.message || 'Session expired')
  }
})

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem(STORAGE_KEY),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
  extraReducers: builder =>
    builder
      .addCase(login.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMe.pending, state => {
        state.loading = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.token = localStorage.getItem(STORAGE_KEY)
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.token = null
        state.error = action.payload
        localStorage.removeItem(STORAGE_KEY)
      }),
})

export const { logout } = slice.actions
export default slice.reducer
