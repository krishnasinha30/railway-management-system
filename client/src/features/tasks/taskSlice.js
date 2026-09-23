import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

export const fetchMyTasks = createAsyncThunk('tasks/mine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tasks/my-tasks')
    return Array.isArray(data?.data) ? data.data : []
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load tasks')
  }
})

export const updateTaskStatus = createAsyncThunk('tasks/update', async ({ id, status }, { rejectWithValue }) => {
  try {
    return (await api.put(`/tasks/${id}`, { status })).data?.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to update task')
  }
})

const slice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchMyTasks.pending, state => { state.loading = true })
    .addCase(fetchMyTasks.fulfilled, (state, action) => {
      state.loading = false
      state.items = Array.isArray(action.payload) ? action.payload : []
    })
    .addCase(fetchMyTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.items = state.items || [] })
    .addCase(updateTaskStatus.fulfilled, (state, action) => {
      if (action.payload?._id) {
        state.items = state.items.map(item => item._id === action.payload._id ? action.payload : item)
      }
    })
})

export default slice.reducer
