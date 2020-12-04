import React, { useEffect, useState, useContext } from "react";
import { Paper, Box, List, ListItem, Button } from "@material-ui/core";
import { makeStyles, Theme, styled } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { colors } from "../../../styles/variables";
import useSeats from "../../../hooks/useSeats";
import useCancelSeat from "../../../hooks/useCancelSeat";
import { socket } from "../../../socket";
import { useHistory } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { SeatContext } from "../../../stores/SeatStore";
import { EmptySeatCount } from "../../../types/seatInfo";

interface styleProps {
  color: string;
}
interface SeatInfo {
  color: string;
  price: number;
}
const useStyles = makeStyles((theme: Theme) => ({
  seatInfoArea: {
    height: "15rem",
    fontWeight: "bold",
    borderRadius: "0.5rem 0.5rem 0 0",
  },
  seatInfoTitle: {
    display: "flex",
    width: "100%",
    paddingTop: "1rem",
    color: colors.naverFontBlack,
    fontWeight: 600,
  },
  infoTitle: {
    float: "left",
    width: "35%",
    padding: "0 0 8px 18px",
  },
  seatTitle: {
    float: "left",
    width: "55%",
    padding: "0 0 0.5rem 0.75rem",
  },
  count: {
    marginLeft: "3px",
    color: "#3787ff",
  },
  seatInfo: {
    overflow: "hidden",
    borderTop: `1px solid ${colors.borderGray}`,
  },
  info: {
    float: "left",
    overflowY: "auto",
    width: "40%",
    minHeight: "151px",
    maxHeight: "151px",
    padding: "5px 18px",
    boxSizing: "border-box",
    borderRight: `1px solid ${colors.borderGray}`,
  },
  seat: {
    float: "left",
    overflowY: "auto",
    width: "60%",
    maxHeight: "151px",
    padding: "0px 12px 6px 18px",
    boxSizing: "border-box",
    borderRight: `1px solid ${colors.borderGray}`,
  },
  item: {
    display: "table",
    width: "100%",
    padding: "0",
    marginTop: "9px",
    fontSize: "1rem",
    lineHeight: "1.25rem",
  },
  title: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "0",
    fontWeight: "bold",
  },
  seatCount: {
    display: "table-cell",
    color: "#666",
    textAlign: "right",
    whiteSpace: "nowrap",
    fontWeight: "normal",
  },
  seatLoca: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: "0",
    fontWeight: "normal",
  },
  cancel: {
    cursor: "pointer",
  },
  stepBtn: {
    padding: "6px",
    backgroundColor: "#efefef",
    borderTop: "1px solid #dbdbdb",
  },
  beforeBtn: {
    width: "39%",
    height: "51px",
    marginRight: "1%",
    backgroundColor: `${colors.naverWhite}`,
    borderRadius: "0",
    border: `1px solid rgba(0,0,0,0.15)`,
    fontWeight: "bold",
  },
  nextBtn: {
    width: "59%",
    height: "51px",
    marginLeft: "1%",
    backgroundColor: `${colors.naverGreen}`,
    borderRadius: "0",
    fontWeight: "bold",
    fontColor: `${colors.naverWhite}`,
  },
}));

const Badge = styled(Box)((props: styleProps) => ({
  display: "inline-block",
  marginTop: "4px",
  width: "13px",
  height: "13px",
  top: "3px",
  marginRight: "0.5rem",
  backgroundColor: props.color,
}));

const unsold = "#01DF3A";

export default function SeatInfoArea() {
  const classes = useStyles();
  const seats = useSeats();
  const cancelSeat = useCancelSeat();
  const history = useHistory();
  const [seatsCount, setSeatsCount] = useState<any>({});
  const { serverSeats } = useContext(SeatContext);
  let seatColor;
  const GET_ITEMS = gql`
    query {
      itemDetail(itemId: "5fc7834bd703ca7366b38959") {
        classes {
          class
          color
        }
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ITEMS);

  const handleClickCancel = (seat: any) => {
    seat.status = "unsold";
    seat.color = unsold;
    cancelSeat(seat.id);
    socket.emit("clickSeat", "A", seat);
    console.log("cancel");
  };

  const handleClickPre = () => {
    history.goBack();
  };

  const handleClickNext = () => {
    const paymentLink = "/payment";
    history.push({
      pathname: paymentLink,
    });
  };

  useEffect(() => {
    socket.emit("joinCountRoom", "A");
    setSeatsCount({ ...serverSeats.counts });
  }, []);
  useEffect(() => {
    setSeatsCount({ ...serverSeats.counts });
    console.log(seats.selectedSeat);
  }, [serverSeats.counts]);
  if (loading) return <>Loading...</>;
  if (error) return <>`Error! ${error.message}`</>;
  if (data) {
  }

  return (
    <>
      <Paper elevation={3} className={classes.seatInfoArea}>
        <Box className={classes.seatInfoTitle}>
          <Box className={classes.infoTitle}>잔여석</Box>
          <Box className={classes.seatTitle}>
            선택좌석
            <Box component="span" className={classes.count}>
              {seats.selectedSeat.length}석
            </Box>
          </Box>
        </Box>
        <Box className={classes.seatInfo}>
          <Box className={classes.info}>
            <List dense={true}>
              {Object.keys(seatsCount).map((element, idx) => {
                return (
                  <ListItem key={idx} className={classes.item}>
                    <Box className={classes.title}>
                      <Badge
                        component="span"
                        color={data.itemDetail.classes[idx].color}
                      ></Badge>
                      <span>{element}</span>
                    </Box>
                    <Box className={classes.seatCount}>
                      {seatsCount[element]}석
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
          <Box className={classes.seat}>
            <List dense={true}>
              {seats.selectedSeat.map((element, idx) => {
                return (
                  <ListItem key={idx} className={classes.item}>
                    <Box className={classes.seatLoca}>
                      <span>
                        <Badge component="span" color={element.color}></Badge>
                        <span>{element.name}</span>
                      </span>
                      <CloseIcon
                        className={classes.cancel}
                        fontSize="small"
                        onClick={() => handleClickCancel(element)}
                      />
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      </Paper>
      <Box className={classes.stepBtn}>
        <Button
          size="large"
          variant="contained"
          onClick={handleClickPre}
          className={classes.beforeBtn}
        >
          이전단계
        </Button>
        <Button
          size="large"
          variant="contained"
          onClick={handleClickNext}
          className={classes.nextBtn}
        >
          다음단계
        </Button>
      </Box>
    </>
  );
}
