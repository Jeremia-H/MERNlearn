import { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import AddEditSensorDataDialog from "../components/AddEditSensorDataDialog";
import SensorDataComponent from "../components/SensorData";
import { SensorData as SensorDataModel } from "../models/sensordata"; //alias so it does nto get so confusing
import * as SensorDatasApi from "../network/sensordatas_api";
import styles from "../styles/SensorDataPage.module.css";
import stylesUtils from "../styles/utils.module.css";

const SensorDatasPageLoggedInView = () => {
  const [sensordatas, setSensorData] = useState<SensorDataModel[]>([]); //We make an array for the useState function and thenn tell it that it should be an empty array and also that sensordata is supposed to be of the datatype of our model as an array
  const [sensordatasLoading, setSensorDatasLoading] = useState(true); //Using this for progressbar of loading data
  const [showSensorDatasLoadingError, setShowSensorDatasLoadingError] =
    useState(false); //Using this for progressbar of loading data

  const [showAddSensorDataDialog, setAddSensorDataDialog] = useState(false);
  const [sensordataToEdit, setSensorDataToEdit] =
    useState<SensorDataModel | null>(null); //type is either the mnodel or null, we initalize with null

  useEffect(() => {
    // with use effect we can setup a function that should run outside of the site rendering, so it does not run every time we render
    async function loadSensordatas() {
      //we need to use an async function inside of the useEffect function because thats just how it works
      try {
        setShowSensorDatasLoadingError(false);
        setSensorDatasLoading(true);
        const sensordatas = await SensorDatasApi.fetchSensorDatas();
        setSensorData(sensordatas);
      } catch (error) {
        console.error(error);
        setShowSensorDatasLoadingError(true);
      } finally {
        setSensorDatasLoading(false);
      }
    }
    loadSensordatas(); // dont forget to call the function because we had to put it inside of another function
  }, []); //we pass this array because this makes it so the useEffect only runs once on site load

  async function deleteSensorData(sensordata: SensorDataModel) {
    try {
      await SensorDatasApi.deleteSensorData(sensordata._id); //call the API function to delete on backend
      setSensorData(
        sensordatas.filter(
          (existingSensorData) => existingSensorData._id !== sensordata._id //this updates our frontend
        )
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  const sensorDataGrid = (
    <Row xs={1} md={2} xl={3} className={`g-4 ${styles.sensordataGrid}`}>
      {" "}
      {/*this changes the layout for screen-size and also applies the bootstrap g-4 styling*/}
      {sensordatas.map(
        (
          sensordata //we map the sensordata we got in our function up here to the Component we created (SensorData.tsx)
        ) => (
          <Col key={sensordata._id}>
            <SensorDataComponent
              sensordataInsideProps={sensordata}
              className={styles.sensordata}
              onSensorDataClicked={setSensorDataToEdit} //is set when the callback from SensorData.tsx happens
              onDeleteSensorDataClicked={deleteSensorData}
            />
          </Col> //and then we also create a key, this should be unique, so we just use the unique ID mongodb gives it
        )
      )}
    </Row>
  );

  return (
    <>
      <Button
        className={`mb-4 ${stylesUtils.blockCenter} ${stylesUtils.FlexCenter}`}
        onClick={() => setAddSensorDataDialog(true)}
      >
        <FaPlus />
        Add new Sensordata
      </Button>
      {sensordatasLoading && <Spinner variant="Primary" />}
      {showSensorDatasLoadingError && (
        <p>Ladefehler went wrong. Please refresh</p>
      )}
      {!sensordatasLoading && !showSensorDatasLoadingError && (
        <>
          {sensordatas.length > 0 ? (
            sensorDataGrid
          ) : (
            <p>There is no sensordata.</p>
          )}
        </>
      )}
      {showAddSensorDataDialog && (
        <AddEditSensorDataDialog
          onDismiss={() => setAddSensorDataDialog(false)} //onDismiss is a function without a return and triggers onHide, so we use this to call the setAddSensorDataDialog function and set it to false and hide the modal with it.
          onSensorDataSaved={(newSensorData) => {
            setSensorData([...sensordatas, newSensorData]);
            setAddSensorDataDialog(false);
          }}
        />
      )}
      {sensordataToEdit && ( //true when we the onclick callback was triggered
        <AddEditSensorDataDialog //this funct is in
          sensordataToEdit={sensordataToEdit}
          onDismiss={() => setSensorDataToEdit(null)}
          onSensorDataSaved={(updatedSensorData) => {
            setSensorData(
              sensordatas.map((existingSensorData) =>
                existingSensorData._id === updatedSensorData._id
                  ? updatedSensorData
                  : existingSensorData
              )
            );
            setSensorDataToEdit(null);
          }}
        />
      )}
    </>
  );
};

export default SensorDatasPageLoggedInView;
