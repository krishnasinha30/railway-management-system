import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
export const fetchAnnouncements = createAsyncThunk('announcements/list', async () => (await api.get('/announcements')).data.data)
const slice = createSlice({ name: 'announcements', initialState: { items: [], loading: false }, reducers: {}, extraReducers: builder => builder.addCase(fetchAnnouncements.pending, s => { s.loading = true }).addCase(fetchAnnouncements.fulfilled, (s, a) => { s.loading = false; s.items = a.payload }).addCase(fetchAnnouncements.rejected, s => { s.loading = false }) })
export default slice.reducer
