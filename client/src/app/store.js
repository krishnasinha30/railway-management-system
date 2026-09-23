import { configureStore } from '@reduxjs/toolkit'
import auth from '../features/auth/authSlice'
import trains from '../features/trains/trainSlice'
import announcements from '../features/announcements/announcementSlice'
import stations from '../features/stations/stationSlice'
import tasks from '../features/tasks/taskSlice'
import bookings from '../features/bookings/bookingSlice'
export const store = configureStore({ reducer: { auth, trains, announcements, stations, tasks, bookings } })
