import {N} from './config';

const idPairs = [
  40,295,295,446,446,647,647,749,749,1051,1051,1407,1407,1509,1509,1610,1610,
  1658,1658,1706,1706,1857,1857,2005,2005,2104,2104,2252,2252,2300,2300,2348,
  2348,2346,1632,1639,1639,1900,1900,2055,2055,2209,2209,2569,51,882,882,883,
  883,1038,1038,1140,1140,1453,1453,1606,1606,1658,26,126,126,329,329,327,327,
  528,528,675,675,776,776,925,925,1076,1076,1074,1074,1326,204,931,931,986,986,
  988,988,1041,1041,1197,1197,1248,1248,1508,1508,1610,1610,1714,1714,1869,45,
  146,146,195,195,397,397,954,954,1158,1158,1413,1413,1669,1669,1920,1920,2020,
  2020,2070,2070,2168,2168,2166,2166,2313,2313,2310,2310,2358,2358,2456,2456,
  2403,2403,2450,2450,2448,1768,1869,1869,1968,1968,2067,2067,2065,2065,2113,
  2113,2111,2111,2209,2209,2257,2257,2304,2304,2399,2399,2450,18,272,272,377,
  377,429,429,583,583,636,636,788,788,838,838,1040,1040,1141,1141,1241,1241,
  1342,1342,1392,1392,1543,1543,1641,1641,1639,628,889,889,1099,1099,1307,1307,
  1411,1411,1412,1158,1259,1259,1409,1409,1509,816,869,869,971,971,1076,1076,
  1129,1129,1234,1234,1392,1392,1548,1548,1652,1652,1755,1755,2065,2584,2329,
  2329,2175,2175,2022,2022,2020,1325,1471,1471,1623,1623,1672,1672,1669,2022,
  1973,1973,1824,1824,1672,2070,2224,2224,2175,2578,2426,2426,2325,2325,2224,
  2567,2469,2469,2419,2419,2370,2370,2320,2320,2322,2322,2377,2377,2430,2430,
  2484,2484,2487,2487,2389,2389,2341,2341,2293,2293,2294,1623,1776,1776,1930,
  1930,2084,2084,2238,2238,2341,1631,1782,1782,1881,1881,1930,1543,1752,1752,
  1958,1958,2113];

function Roads(){
  this.offset = 0;
  this.idTable = idPairs;
  this.len = this.idTable.length;
}
export default Roads