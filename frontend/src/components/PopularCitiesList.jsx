import React from 'react';
import bucImage from '../images/bucuresti.jpeg';
import clujImage from '../images/cluj.jpeg';
import constImage from '../images/constanta.jpeg';
import bravImage from '../images/brasov.jpeg';
import iasiImage from '../images/iasi.jpeg';
import timImage from '../images/timisoara.jpeg';
import predealImage from '../images/predeal.jpeg';
import poianaImage from '../images/poiana.jpg';
import sinImage from '../images/sinaia.jpeg';

function PopularCitiesList() {
    const cities=[
        {
             id: 1, name: 'București', location:'București', imageUrl:bucImage},
            {id: 2, name:'Cluj-Napoca', location:'Cluj-Napoca', imageUrl:clujImage},
            {id:3, name:'Brașov', location:'Brașov', imageUrl:bravImage},
            {id:4, name:'Constanța', location:'Constanța', imageUrl:constImage},
            {id:5, name:'Iași', location:'Iași', imageUrl:iasiImage},
            {id:6, name:'Timișoara', location:'Timișoara', imageUrl:timImage}
    ];
    const exploreRomaniaDestinations = [
        { name: 'Brașov', image: bravImage},
        { name: 'Sinaia', image: sinImage },
        { name: 'București', image: bucImage },
        { name: 'Poiana Brașov', image: poianaImage },
        { name: 'Predeal', image: predealImage },
        { name: 'Cluj-Napoca', image: clujImage }
      ];
    return (
        <div className="container-fluid px-4 py-4">
        <h2 className="mb-4">Destinații populare acum</h2>
        <p className="text-muted mb-4">Cele mai populare destinații pentru călătorii din România</p>
        
        <div className="row g-3 mb-5">
          {cities.map((city, index) => (
            <div key={index} className="col-12 col-md-4 col-lg-2-4">
              <div className="card h-100 border-0 position-relative">
                <img 
                  src={city.imageUrl} 
                  alt={city.name} 
                  className="card-img-top rounded" 
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body px-1 pt-2 pb-0">
                  <h5 className="card-title h6">{city.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        <h3 className="mb-4">Explorați România</h3>
        <p className="text-muted mb-4">Aceste destinații populare au multe de oferit</p>
        
        <div className="row g-3">
          {exploreRomaniaDestinations.map((destination, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-2">
              <div className="card h-100 border-0 position-relative">
                <img 
                  src={destination.image} 
                  alt={destination.name} 
                  className="card-img-top rounded" 
                  style={{height: '150px', objectFit: 'cover'}}
                />
                <div className="card-body px-1 pt-2 pb-0">
                  <h5 className="card-title h6">{destination.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}

export default PopularCitiesList;