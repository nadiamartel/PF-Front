import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Card from "../Card/Card";
import Paging from "../Paging/Paging";
import SearchBar from "../../Components/SearchBar/SearchBar";
import {
  orderCost,
  allFilters
} from "../../redux/Actions/filters";
import style from "./CardsContainer.module.css";

const CardsContainer = () => {
  const dispatch = useDispatch();

  const activities = useSelector((state) => state.activities);
  const all = useSelector((state) => state.allActivities);

  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage, setactivitiesPerPage] = useState(4);
  const indexOfLastActivitie = currentPage * activitiesPerPage;
  const indexOfFirstActivitie = indexOfLastActivitie - activitiesPerPage;
  const currentActivities = activities.slice(
    indexOfFirstActivitie,
    indexOfLastActivitie
  );

  const [cost, setCost] = useState("");

  const [activityFilter,setActivityFilter] = useState("all")
  const [activityPlayers,setPlayersFilter] = useState("all")
  const [activityAges,setAgesFilter] = useState("all")

  const handleFilterPlayers = (event) => {
    event.preventDefault();
    setPlayersFilter(event.target.value)
  }

  const handleFilterActivity = (event) => {
    event.preventDefault();
    setActivityFilter(event.target.value)
  }

  const handleFilterAges = (event) => {
    event.preventDefault();
    setAgesFilter(event.target.value)
  }

  const handleFilter = () => {
    setCurrentPage(1);
    let filters = {
      players: activityPlayers,
      activity: activityFilter,
      ages: activityAges,
    };
    dispatch(allFilters(filters));
    setCost(""); 
  };

  const paginado = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const orderBy = (event) => {
    setCurrentPage(1);
    event.preventDefault();
    dispatch(orderCost(event.target.value));
    setCost(event.target.value);
  };

  return (
    <div>
      <div className={style.nav}>
        <div className={style.filtersContainer}>
          <div className={style.search}>
            <SearchBar />
          </div>
          <div className={style.filters}>
            <select onChange={(event) => orderBy(event)} value={cost}>
              <option value="" disabled hidden>
                Precio
              </option>
              <option value="ascendent">Menor Precio</option>
              <option value="descendent">Mayor Precio</option>
            </select>
          </div>
          <div className={style.filters}>
            <select onChange={handleFilterPlayers}>
              <option value="" disabled hidden>
                Jugadores
              </option>
              <option value="all">Todos</option>
              <option value="2-4">2 - 4</option>
              <option value="4-8">4 - 8</option>
              <option value="+8">+8</option>
            </select>
          </div>
          
          <div className={style.filters}>
            <select onChange={(event) => handleFilterActivity(event)}>
              <option value="" disabled hidden>
                Actividades
              </option>
              <option value="all">Todas</option>
              {all.map((activity) => (
                <option key={activity.id} value={activity.name}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
                
          <div className={style.filters}>
            <select onChange={(event) => handleFilterAges(event)}>
              <option value="all">Todas las edades</option>
              <option value="Niños">Niños</option>
              <option value="Adultos">Adultos</option>
            </select> 
         </div>   

         <button type="submit" onClick={handleFilter}>Aplicar Filtros</button>

        </div>
      </div>

      <div className={style.container}>
        {currentActivities?.map(
          ({ id, name, picture, cost, stores, players }) => {
            console.log(players);
            return (
              <Card
                key={id}
                id={id}
                picture={picture}
                name={name}
                cost={cost}
                stores={stores?.map((element) => element.name)}
                players={players?.map((player) => player)}
              />
            );
          }
        )}
      </div>
      <div>
        <Paging
          activitiesPerPage={activitiesPerPage}
          activities={activities.length}
          currentPage={currentPage}
          paginado={paginado}
        />
      </div>
    </div>
  );
};

export default CardsContainer;
