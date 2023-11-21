import React, { useEffect, useState } from 'react';
import { SensorData as SensorDataModel} from './models/sensordata';                                            //alias so it does nto get so confusing
import  SensorDataComponent from './components/SensorData';
import { Button, Col, Container, Row } from 'react-bootstrap';
import styles from "./styles/SensorDataPage.module.css"
import stylesUtils from "./styles/utils.module.css"
import * as SensorDatasApi from "./network/sensordatas_api";
import AddSensorDataDialog from './components/AddSensorDataDialog';

function App() {
  const[sensordatas, setSensorData] = useState<SensorDataModel[]>([]);                                          //We make an array for the useState function and thenn tell it that it should be an empty array and also that sensordata is supposed to be of the datatype of our model as an array

  const [showAddSensorDataDialog, setAddSensorDataDialog] = useState(false);

  useEffect(() => {                                                                                            // with use effect we can setup a function that should run outside of the site rendering, so it does not run every time we render
    async function loadSensordatas() {                                                                         //we need to use an async function inside of the useEffect function because thats just how it works
    try {
      const sensordatas = await SensorDatasApi.fetchSensorDatas();
      setSensorData(sensordatas);
    } catch (error) {
      console.error(error);
      alert(error);
    }
    }
    loadSensordatas();                                                                                         // dont forget to call the function because we had to put it inside of another function
  }, []);                                                                                                      //we pass this array because this makes it so the useEffect only runs once

  async function deleteSensorData(sensordata: SensorDataModel) {
    try {
      await SensorDatasApi.deleteSensorData(sensordata._id); //call the API function to delete on backend
      setSensorData(sensordatas.filter(existingSensorData => existingSensorData._id !== sensordata._id));
    } catch (error) {
      console.error(error)
      alert(error)
    }  
  }


  return (
    <Container>
      <Button
       className={`mb-4 ${stylesUtils.blockCenter}`}

       onClick={() => setAddSensorDataDialog(true)}>
        Add new Sensordata
      </Button>
      <Row xs={1} md={2} xl={3} className='g-4'>                                                        {/*this changes the layout for screen-size and also applies the bootstrap g-4 styling*/}                               
      {sensordatas.map(sensordata => (                                                                          //we map the sensordata we got in our function up here to the Component we created (SensorData.tsx)
      <Col key={sensordata._id}>
        <SensorDataComponent 
        sensordataInsideProps={sensordata} 
        className={styles.sensordata}                           
        onDeleteSensorDataClicked={deleteSensorData}
        />
        </Col>                                                                                                 //and then we also create a key, this should be unique, so we just use the unique ID mongodb gives it  
      ))}
      </Row>
      {showAddSensorDataDialog &&
      <AddSensorDataDialog
      onDismiss={() => setAddSensorDataDialog(false)} //onDismiss is a function without a return and triggers onHide, so we use this to call the setAddSensorDataDialog function and set it to false and hide the modal with it.
      onSensorDataSaved={(newSensorData) => {
        setSensorData([...sensordatas, newSensorData])
        setAddSensorDataDialog(false)
      }}

      />
      }
    </Container>
  );
}

export default App;
