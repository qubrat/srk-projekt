import React from 'react';
import styles from './HelloScreen.module.css';
import { Clock } from "../../Components/Clock";
import logo from "../../Assets/Images/logo.png"

interface HelloScreenProps {
    onClick: () => void;
}

const HelloScreen = (props: HelloScreenProps): JSX.Element => {

    return (
        <div className={styles.container} onClick={() => props.onClick()}>
            <div>
                <div className={styles.logo}>SRK</div>
                <img src={logo} className={styles.logoImg} />
            </div>
            <div className={styles.infoWrapper}>
                <div className={styles.separator}></div>
                <div className={styles.info}>Potwierdź swoją rezerwację</div>
            </div>
            <div className={styles.clickMe}>NACIŚNIJ ABY <br/> ROZPOCZĄĆ</div>
            <Clock className={styles.clock}/>
        </div>
    );
}

export default HelloScreen;