import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

export const fetchTrains = createAsyncThunk('trains/list', async (params = '', { rejectWithValue }) => {
  try {
    const query = typeof params === 'string'
      ? (params ? `?station=${params}` : '')
      : `?${new URLSearchParams(Object.entries(params).filter(([, value]) => value))}`
    const { data } = await api.get(`/trains${query}`)
    return Array.isArray(data?.data) ? data.data : []
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Unable to load trains')
  }
})

export const searchTrains = createAsyncThunk('trains/search', async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/trains/search?query=${encodeURIComponent(query)}`)
    return Array.isArray(data?.data) ? data.data : []
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Unable to search trains')
  }
})

const slice = createSlice({
  name: 'trains',
  initialState: { trains: [], selectedTrain: null, loading: false, error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchTrains.pending, s => { s.loading = true; s.error = null })
    .addCase(fetchTrains.fulfilled, (s, a) => { s.loading = false; s.trains = Array.isArray(a.payload) ? a.payload : [] })
    .addCase(fetchTrains.rejected, (s, a) => { s.loading = false; s.error = a.payload; s.trains = s.trains || [] })
    .addCase(searchTrains.pending, s => { s.loading = true; s.error = null })
    .addCase(searchTrains.fulfilled, (s, a) => { s.loading = false; s.trains = Array.isArray(a.payload) ? a.payload : [] })
    .addCase(searchTrains.rejected, (s, a) => { s.loading = false; s.error = a.payload; s.trains = s.trains || [] })
})

export default slice.reducer
