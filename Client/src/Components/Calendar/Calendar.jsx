import styles from './Calendar.module.css'
import { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useSelector, useDispatch} from 'react-redux';
import {initMercadoPago, Wallet} from '@mercadopago/sdk-react';
import axios from "axios";
import {saveInfoReservation} from '../../redux/Actions/saveInfoReservation';
import Swal from 'sweetalert2';


export default function CalendarComponent() {
  const dispatch = useDispatch();

  const [value, onChange] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const activity = useSelector((state) => state.detail);
  const idUser = useSelector((state) => state.clientId);
  let selected = selectedDate? `${selectedDate.dayName} ${format(selectedDate.date, 'dd/MM/yyyy', { locale: es })}`: null
  const dayReservations = activity?.reservations?.find(reserv=>reserv.date===selected)
  const id = activity?.id
  const cost = activity?.cost
  const name = activity?.name
  
  const [reservation,setReservation] = useState({
    date:'',
    cost:cost,
    hour:'',
    idUser:idUser,
    idActivity:id
  })
  
  const week = ["Domingo", "Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
  const forbiddenDays = week.filter((day) => !(activity?.days?.includes(day)));

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleDateChange = (date) => {
    const currentDate = new Date();

    if (isSameDay(date, currentDate) || date > currentDate) {
      setSelectedDate({
        date,
        dayName: capitalize(format(date, 'EEEE', { locale: es }))
      });
    }
    if(!activity.days.includes(capitalize(format(date, 'EEEE', { locale: es })))){
      setSelectedDate({date,dayName:"Día no válido"})
    }
    if(!isSameDay(date, currentDate)&&date<currentDate){
      setSelectedDate({
        date,dayName:"Fecha pasada"
      })
    }
  };

  const handleClick = (hour) => {
    if (selectedHour === hour) {
      setSelectedHour(null);
    } else {
      setSelectedHour(hour);
      setReservation({
        ...reservation,
        hour:hour,
        date:selected,
        cost:cost,
        idActivity:id,
        idUser:idUser,
      })
    }
  };

  //Mercado Pago Funciones 
  const [preferenceId, setPreferenceId] = useState(null);
  initMercadoPago('APP_USR-f77b254e-b7df-4f4e-9da7-82b3a2e8be04')

  const createPreference = async () => {
    try {
      const response = await axios.post('http://localhost:3001/create_preference', {
        description: name,
        price: cost,
        quantity: 1
      })

      const {id} = response.data
      return id
    } catch (error) {
      console.log(error);
    }
  }

  const handleBuy = async () => {
    const id = await createPreference(); 
    if (id) {
      setPreferenceId(id)
      dispatch(saveInfoReservation(reservation))
    }
  }

  return (
    <div >
      <div className={styles['calendar-container']}>
      <Calendar onChange={handleDateChange}
  value={value}
  tileClassName={({ date }) =>
    forbiddenDays.includes(capitalize(format(date, 'EEEE', { locale: es }))) ? styles.forbidden : ''
  }/>
      <p style={{color:"white"}}>
        Fecha seleccionada:{' '}
        {selectedDate
          ? `${selectedDate.dayName} ${format(selectedDate.date, 'dd/MM/yyyy', { locale: es })}`
          : 'Ninguna'}
      </p>
      </div>
      <div style={{color:"white"}}>
        {!selectedDate || selectedDate.dayName==="Fecha pasada"||selectedDate.dayName=== "Día no válido"?null: 
         activity?.hours?.length > 0 ? 
         (activity?.hours?.map((hour) => (
           <div key={hour}>
              <button  className={selectedHour === hour ? styles.selected : styles.notSelected} value={hour} disabled={dayReservations?.hour===hour} onClick={() => handleClick(hour) }>{hour} hs</button>
           </div>
           ))
         ) : ( <p>Sin Horarios</p>)
        }

        <button onClick={handleBuy}>Reservar</button> 
        {preferenceId && <Wallet initialization={{preferenceId}} />}
      </div>
    </div>
  );
}