import React, {useContext, useState} from 'react';
import { Input } from 'antd';
import { Bar } from 'react-chartjs-2'
import './App.css';

const { Search } = Input;
const context = React.createContext()

function App() {
  const [state,setState] = useState({
    searchTerm:''
  })
  return (
    <context.Provider value={{
      ...state,
      set: v=>setState({...state, ...v})
    }}>
      <div className="app">
        <Header/>
        <Body/>
      </div>
    </context.Provider>
  );
}

function Header(){
  const ctx = useContext(context)
  return <header className="header">
    <Search placeholder="Enter your location..."
      value={ctx.searchTerm}
      onChange={e=> ctx.set({searchTerm: e.target.value})}
      onSearch={e=>{
        search(ctx)
      }}
      style={{width:'80%'}}
    />
  </header>
}

function Body(){
  const ctx = useContext(context)
  const {error, weather} = ctx
  let data
  if (weather){
    data = {
      labels:weather.daily.data.map(d=>d.time),
      datasets:[{
        data:weather.daily.data.map(d=>d.temperatureHigh)
      }]
    }
  }
  return <div className="body" >
    {error && <div>{error}</div>}
    {weather && <div>
      <Bar data={data}
        width={800} height={800}
      />
    </div>
    }
  </div>
}

async function search({searchTerm, set}){
  try{
  const search = searchTerm
  set({searchTerm:'', error:''})
  
  const osmurl = `https://nominatim.openstreetmap.org/search/${search}?format=json`
  const r = await fetch(osmurl)
  const loc = await r.json()
  if(!loc[0]){
    return set({error:'No city matching that query'});
  }
  const city = loc[0]

  const key = '8c9e714ad9a55da7d5d51e9c719d2de0'
  const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${city.lat},${city.lon}`
  const r2 = await fetch(url)
  const weather = await r2.json()
  set({weather})
  } catch(e){
    set({error:e.message})
  }
}

export default App;
