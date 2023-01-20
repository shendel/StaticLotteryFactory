import type { NextPage } from "next"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"
import { getLink, getAssets, getBoolOption, getIntOption } from "../helpers"
import useStorage from "../storage/"
import { useEffect, useState } from "react"


const Home: NextPage = (props) => {
  const router = useRouter();
  const { isOwner, getText, getDesign } = props

  return (
    <div className={styles.container}>
      INDEX PAGE
    </div>
  );
};

export default Home;
