import './index.css'
import axios from "axios"
import countriesJsonUk from './translate/uk/countries.json'
import {Country} from "./Country"
import $ from 'jquery'

const href = window.location.origin
const sourceUrl = `${href}/wp-json/wp/v2/pages/25`
const getCookie = (name) => {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const lang = getCookie("pll_language")

document.addEventListener('DOMContentLoaded', async _ => {

  let countriesData = await axios.get(sourceUrl)
    .then((res) => res.data['acf']['table_countries'])
    .then(tableCountries =>
      tableCountries
        .map(countryCount =>
          new Country(
            countryCount["country_count"]["country"].trim(),
            countriesJsonUk
              .find(cJson => cJson['name'] === countryCount["country_count"]["country"].trim())['alpha2'],
            countryCount["country_count"]["count"]
          )
        )
    )
    .then(c => import(`./translate/${lang}/countries.json`)
      .then(module => module.default)
      .then(countriesByLang =>
        c.filter(cc => countriesByLang.find(cbl => cbl['alpha2'] === cc['alpha2']))
          .map(cf => ({
            ...cf,
            name: countriesByLang.find(cbl => cbl['alpha2'] === cf['alpha2'])['name']
          }))
      )
    )

  const countriesDataMap = new Map(countriesData.map(c => [c.alpha2.toUpperCase(), c]))
  const textTip = {
    uk: "організованно <br>перевезень",
    de: "organisierter <br>transport",
    en: "organized <br>transportation"
  }

  const tip = document.createElement('div');
  tip.classList.add('description');
  tip.innerHTML = `<p class="country"></p>
    <div style="display: flex; align-items: center">
        <span class="count"></span>
        <span class="text">${textTip[lang]}</span>
    </div>
    <div class="arrow-down"></div>`


  const rootMap = document.querySelector("#root-map");

  const tipCountry = document.querySelector('.description .country')
  const tipCount = document.querySelector('.description .count')

  tip.style.transform =
    'translate(' +
    (rootMap.hasAttribute('tip-left') ? 'calc(-100% - 5px)' : '15px') + ', ' +
    (rootMap.hasAttribute('tip-top') ? '-100%' : '0') +
    ')';

  const paths = [...document.querySelectorAll("#root-map path")];

  rootMap.appendChild(tip);
  rootMap.onmouseover = _ => {
    document.querySelector(".description").classList.add('active')
  }

  paths.forEach(p => {
    p.onmousemove = e => {
      document.querySelector(".description").style.left = (e.clientX - 35) + 'px'
      document.querySelector(".description").style.top = (e.clientY - 147) + 'px';
    }
  });

  paths.filter(p => countriesData.some(c => c.alpha2 === p.id.toLowerCase()))
    .forEach(p => {
      p.classList.remove('st0')
      p.classList.add('active')

      p.onmouseover = e => {
        document.querySelector('.description .country').innerText = countriesDataMap.get(e.target.id).name
        document.querySelector('.description .count').innerText = countriesDataMap.get(e.target.id).count
        document.querySelector(".description").classList.add('visible')
      }
      p.onmouseleave = _ => {
        document.querySelector(".description").classList.remove('visible')
      }

      window.onscroll = _ => {
        if(!$(p).is(":hover")) {
          document.querySelector(".description").classList.remove('visible')
        }
      }

    })

})

