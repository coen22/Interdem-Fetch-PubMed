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
        
        <template is="dom-repeat" items="[[papers]]">
          <h2>{{item.year}}</h2>
          <template is="dom-repeat" items="[[item.articles]]">
            <h3>{{item.MedlineCitation.Article.ArticleTitle}}</h3>
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
        value: [],
        notify: true
      },
      loaded: {
        type: Boolean,
        value: false
      }
    };
  }

  isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  asArray(obj) {
    return Object.entries(obj);
  }

  isArray(obj) {
    return Array.isArray(obj);
  }

  _dataLoaded(e) {
    this.loaded = true;

    let author = e.model.item;

    if (author.data && author.data['PubmedArticle'] && Array.isArray(author.data['PubmedArticle'])) {
      author.data['PubmedArticle'].forEach(paper => {
        let year = paper['MedlineCitation']['DateRevised']['Year'];
        let title = paper['MedlineCitation']['Article']['ArticleTitle'];

        if (!this.papers.includes(year)) {
          let yearTmp = {};

          yearTmp['year'] = year;
          yearTmp['titles'] = [];
          yearTmp['articles'] = [];

          this.papers.push(yearTmp);
        }

        if (!this.papers[year]['titles'].includes(title)) {
          this.papers[year]['titles'].push(title);
          this.papers[year]['articles'].push(paper);
        }
      });
    } else {
      console.warn('warning no data');
    }

    this.papers.sort(function (a, b) {
      return a['year'] < b['year'];
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define('fetch-app', FetchApp);