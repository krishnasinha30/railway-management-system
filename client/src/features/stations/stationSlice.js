import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
export const fetchStations = createAsyncThunk('stations/list', async (_, { rejectWithValue }) => { try { return (await api.get('/stations')).data.data } catch (error) { return rejectWithValue(error.response?.data?.message || 'Unable to load stations') } })
const slice = createSlice({ name: 'stations', initialState: { items: [], loading: false, error: null }, reducers: {}, extraReducers: builder => builder.addCase(fetchStations.pending, state => { state.loading = true }).addCase(fetchStations.fulfilled, (state, action) => { state.loading = false; state.items = action.payload }).addCase(fetchStations.rejected, (state, action) => { state.loading = false; state.error = action.payload }) })
export default slice.reducer
