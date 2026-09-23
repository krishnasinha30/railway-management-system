import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

export const fetchStations = createAsyncThunk('stations/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/stations')
    return Array.isArray(data?.data) ? data.data : []
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load stations')
  }
})

const slice = createSlice({
  name: 'stations',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchStations.pending, state => { state.loading = true })
    .addCase(fetchStations.fulfilled, (state, action) => {
      state.loading = false
      state.items = Array.isArray(action.payload) ? action.payload : []
    })
    .addCase(fetchStations.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.items = state.items || [] })
})

export default slice.reducer
