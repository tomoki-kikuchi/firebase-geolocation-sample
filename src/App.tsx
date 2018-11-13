import React, { Component } from 'react';
import {db} from './firebase'

import './App.css';
const GPS_OPTION = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
};
interface State {
    latitude:number
    longitude:number
    oldLatitude:number
    oldLongitude:number
    postData:Location[]
}
interface Props {

}
interface Location {
    latitude:number
    longitude:number
}

class App extends Component<Props,State> {
    private watchId:any;
    constructor(props:any) {
        super(props);
        this.state = {
            latitude:0,
            longitude:0,
            oldLatitude:0,
            oldLongitude:0,
            postData:[]
        };
        this.initWatchPosition();
        this.getLocation();

    }

    postLocation = (latitude:number,longitude:number)=>{
        const postData = {
            latitude: latitude,
            longitude: longitude
        };
        db.collection("location").doc("car1").set(postData)
        .then((docRef)=> {
            console.log('Post Data::',postData);
            this.setState((prevState)=>{
                return {postData:[...prevState.postData,postData]}
            })
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    };

    getLocation = ()=>{
        const docRef = db.collection("location").doc("car1");
        docRef.onSnapshot((doc)=> {
            if (doc.exists) {
                console.log("Loadしたデータ:", doc.data());
                const docData:any = doc.data();
                const {latitude,longitude} = this.state;
                this.setState({
                    oldLatitude:latitude,
                    oldLongitude:longitude,
                    latitude:docData.latitude,
                    longitude:docData.longitude
                })
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        })
        // docRef.get().then((doc)=> {
        //     if (doc.exists) {
        //         console.log("Loadしたデータ:", doc.data());
        //         const docData:any = doc.data()
        //         const {latitude,longitude} = this.state;
        //         this.setState({
        //             oldLatitude:latitude,
        //             oldLongitude:longitude,
        //             latitude:docData.latitude,
        //             longitude:docData.longitude
        //         })
        //     } else {
        //         // doc.data() will be undefined in this case
        //         console.log("No such document!");
        //     }
        // }).catch((error)=> {
        //     console.log("Error getting document:", error);
        // });

    };

    initWatchPosition = ()=>{
        this.watchId = navigator.geolocation.watchPosition((position:any)=>{
            this.postLocation(position.coords.latitude,position.coords.longitude);
        },()=>{

        },GPS_OPTION);
    };

    clearWatchPosition = ()=>{
        navigator.geolocation.clearWatch(this.watchId);
    };

    render() {
        const {latitude,longitude,oldLatitude,oldLongitude,postData} = this.state;

    return (
      <div className="App">
          <div className="wrap">
              <div>
                  <p>■緯度</p>
                  <ul>
                      <li>{latitude}  (差分：{latitude - oldLatitude})</li>
                  </ul>
              </div>
              <div>
                  <p>■経度</p>
                  <ul>
                      <li>{longitude}  (差分：{longitude - oldLongitude})</li>
                  </ul>
              </div>
              <div className="postData">
                  <p>■POSTしたデータ</p>
                  <ul>
                      {postData.map((data,index)=>{
                          return(
                              <li key={index}>{JSON.stringify(data)}</li>
                          )
                      })}

                  </ul>
              </div>
          </div>

          <br />

          <button onClick={this.clearWatchPosition}>クリアー</button>
      </div>
    );
  }
}

export default App;


