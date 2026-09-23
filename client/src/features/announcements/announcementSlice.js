import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

export const fetchAnnouncements = createAsyncThunk('announcements/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/announcements')
    return Array.isArray(data?.data) ? data.data : []
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Unable to load announcements')
  }
})

const slice = createSlice({
  name: 'announcements',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchAnnouncements.pending, s => { s.loading = true })
    .addCase(fetchAnnouncements.fulfilled, (s, a) => { s.loading = false; s.items = Array.isArray(a.payload) ? a.payload : [] })
    .addCase(fetchAnnouncements.rejected, s => { s.loading = false; s.items = s.items || [] })
})

export default slice.reducer
