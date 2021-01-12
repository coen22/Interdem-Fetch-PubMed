import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';
import '@polymer/iron-ajax/iron-ajax';
import '@vaadin/vaadin-details/vaadin-details';

/**
 * @customElement
 * @polymer
 */
class FetchApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        * {
          box-sizing: border-box;
          font-family: sans-serif;
        }
      
        .page-width {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
      </style>
      
      <!-- routing -->
      <app-location route="{{route}}" query-params="{{queryParams}}" route-changed="routeChanged"></app-location>
      <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{routeTail}}"></app-route>

        <!-- authors -->
        <iron-ajax auto="true" 
          url="data/names.json" 
          handle-as="json"
          last-response="{{authors}}">
        </iron-ajax>
      
      <div class="page-width">
        <h1>Articles</h1>
        <template is="dom-if" if="{{!loaded}}">
          Loading...
        </template>
        <template id="authorsRepeat" is="dom-repeat" items="[[authors]]">
          <!-- data -->
          <iron-ajax auto="true" 
            url="backend/fetch.php?author={{item.name}}" 
            handle-as="json"
            last-response="{{item.data}}"
            on-response="_dataLoaded">
          </iron-ajax>
        </template>

        <template id="papersLayout" is="dom-repeat" items="[[papers]]">
          <h2>{{item.name}}</h2>
          <template is="dom-repeat" items="[[item.years]]">
            <h3>{{item.year}}</h3>
            <template is="dom-repeat" items="[[item.articles]]">
              <p>{{item.MedlineCitation.Article.ArticleTitle}}</p>
            </template>
          </template>
        </template>
        <br/>
        <br/>
      </div>
    `;
  }

  static get properties() {
    return {
      authors: {
        type: Object,
        notify: true,
      },
      papers: {
        type: Array,
        value: [
          {
            id: 0,
            name: 'Diagnosis and development of symptoms',
            keywords: [ 'diagnosis', 'symptoms', ' validation' ]
          },
          {
            id: 1,
            name: 'Health Economics',
            keywords: [ 'economics' ]
          },
          {
            id: 2,
            name: 'Organization of dementia care',
            keywords: [ 'organization', 'organisation' ]
          },
          {
            id: 3,
            name: 'Persons need, quality of life and social/ethical issues',
            keywords: [ 'social', 'ethical', 'ethics', 'persons need', 'quality of life' ]
          },
          {
            id: 4,
            name: 'Psychosocial interventions for persons with dementia',
            keywords: [ 'interventions', 'persons with dementia', 'psychosocial' ]
          },
          {
            id: 5,
            name: 'Psychosocial interventions for caregivers',
            keywords: [ 'interventions', 'caregivers', 'psychosocial' ]
          },
          {
            id: 6,
            name: 'Other',
            keywords: []
          },
          {
            id: 7,
            name: 'Biological',
            keywords: ['synaptic', 'exosomes', 'cerebrospinal', 'fluid', 'progranulin', 'Ultrasound']
          }
        ],
        notify: true
      },
      loaded: {
        type: Boolean,
        value: false
      }
    };
  }

  _dataLoaded(e) {
    this.loaded = true;

    let author = e.model.item;

    if (author.data && author.data['PubmedArticle'] && Array.isArray(author.data['PubmedArticle'])) {
      author.data['PubmedArticle'].forEach(paper => {
        if (paper['MedlineCitation'] && paper['MedlineCitation']['Article']) {
          let year = paper['MedlineCitation']['DateRevised']['Year'];
          let title = paper['MedlineCitation']['Article']['ArticleTitle'];
          let abstract = '';

          if (paper['MedlineCitation']['Article']['Abstract'] &&
              paper['MedlineCitation']['Article']['Abstract']['AbstractText']) {
            abstract = this.getAbstractText(paper['MedlineCitation']['Article']['Abstract']['AbstractText']);
          }

          let text = (title + ' ' + abstract).toLowerCase();
          let category = this.papers.sort((a, b) => {
            let aMatches = 0;

            a['keywords'].forEach(x => {
              let regex = new RegExp(x, 'g');
              let matches = text.match(regex);
              if (matches)
                aMatches += matches.length;
            });

            let bMatches = 0;

            b['keywords'].forEach(x => {
              let regex = new RegExp(x, 'g');
              let matches = text.match(regex);
              if (matches)
                bMatches += matches.length;
            });

            return aMatches < bMatches;
          })[0];
          let categoryIdx = this.papers.indexOf(category);

          if (!category['years'])
            category['years'] = [];

          if (category['years'].filter(x => x['year'] == year).length == 0) {
            let yearTmp = {};

            yearTmp['year'] = year;
            yearTmp['titles'] = [];
            yearTmp['articles'] = [];

            category['years'].push(yearTmp);

            category['years'].sort((a, b) => a['year'] < b['year']);
          }

          let categoryYear = null;
          category['years'].forEach(x => {
            if (x['year'] === year)
              categoryYear = x;
          });

          let categoryYearIdx = category['years'].indexOf(category);

          if (!categoryYear['titles'].includes(title)) {
            categoryYear['titles'].push(title);

            paper['abstract'] = abstract;
            categoryYear['articles'].push(paper);
          }
        }
      });
    } else {
      console.warn('warning no data');
    }

    this.papers.sort((a, b) => {
      return a.id > b.id;
    });

    this.$.papersLayout.render();
  }

  getAbstractText(obj) {
    if (this.isObject(obj)) {
      if (this.isArray(obj)) {
        let res = '';

        obj.forEach(item => res += item);

        return res;
      } else {
        let res = '';

        let tmp = Object.entries(obj);
        tmp.forEach(item => res += item.value);

        return res;
      }
    } else {
      if (typeof  obj !== 'string')
        console.warn('The data type didn\'t match');

      return obj;
    }
  }

  isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  isArray(obj) {
    return Array.isArray(obj);
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define('fetch-app', FetchApp);