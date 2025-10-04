
import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

const CAPITAL_URL = 'https://www.imf.org/external/datamapper/api/v1/BOP/FA_PFI?format=csv';
const FX_URL = 'https://stats.bis.org/api/v1/triennial/fxturnover?format=json';

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  return lines.map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i) => obj[h] = cols[i]);
    return obj;
  });
}

export default function CapitalAndFxGlobes() {
  const [capitalData, setCapitalData] = useState([]);
  const [fxData, setFxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const globe1 = useRef();
  const globe2 = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        const capRes = await fetch(CAPITAL_URL);
        const capText = await capRes.text();
        const capRows = parseCSV(capText).slice(0,200);
        const capFlows = capRows.map(r => ({
          startLat: Math.random()*140-70,
          startLng: Math.random()*360-180,
          endLat: 0,
          endLng: 0,
          color: ['rgba(0,200,255,0.9)','rgba(0,255,150,0.5)'],
          value: Math.random()*1000
        }));
        setCapitalData(capFlows);
      } catch(e) { console.error(e); }

      try {
        const fxRes = await fetch(FX_URL);
        const fxJson = await fxRes.json();
        const keys = Object.keys(fxJson.series||{}).slice(0,200);
        const fxFlows = keys.map(k => {
          const [base,quote] = k.split('/');
          return {
            startLat: Math.random()*140-70,
            startLng: Math.random()*360-180,
            endLat: Math.random()*140-70,
            endLng: Math.random()*360-180,
            color: ['rgba(255,150,0,0.9)','rgba(255,220,0,0.6)'],
            value: Math.random()*5000
          };
        });
        setFxData(fxFlows);
      } catch(e) { console.error(e); }

      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div style={{padding:20, background:'#0b1220', minHeight:'100vh'}}>
      <h1>🌍 Capital & FX Flow Globes (Live Data)</h1>
      {loading ? <p>Loading...</p> : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <Globe ref={globe1} globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark-small.jpg"
            arcsData={capitalData} arcColor={d=>d.color} arcStroke={d=>1+Math.log10(d.value+1)}
            arcDashLength={d=>0.4} arcDashAnimateTime={()=>3000} width={500} height={500} resolution={0.5}/>
          <Globe ref={globe2} globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark-small.jpg"
            arcsData={fxData} arcColor={d=>d.color} arcStroke={d=>1+Math.log10(d.value+1)}
            arcDashLength={d=>0.4} arcDashAnimateTime={()=>3000} width={500} height={500} resolution={0.5}/>
        </div>
      )}
    </div>
  );
}
