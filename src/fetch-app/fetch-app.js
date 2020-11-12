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

      <!-- data -->
      <iron-ajax auto="true" 
        url="backend/fetch.php" 
        handle-as="json"
        last-response="{{articles}}">
      </iron-ajax>
      
      <div class="page-width">
        <h1>Articles</h1>
        <template is="dom-if" if="{{!loaded}}">
          Loading...
        </template>
        <template is="dom-if" if="{{loaded}}">
          <template is="dom-repeat" items="[[articles.PubmedArticle]]">
            <vaadin-details theme="filled">
              <div slot="summary">
                {{item.MedlineCitation.Article.ArticleTitle}} 
                ({{item.MedlineCitation.DateRevised.Year}})
              </div>
              <template is="dom-if" if="{{isObject(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                <template is="dom-repeat" items="[[item.MedlineCitation.Article.Abstract.AbstractText]]">
                  <p>{{item}}</p>
                </template>
              </template>
              <template is="dom-if" if="{{!isObject(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                <p>{{item.MedlineCitation.Article.Abstract.AbstractText}}</p>
              </template>
            </vaadin-details>
          </template>
        </template>
      </div>
    `;
  }

  static get properties() {
    return {
      articles: {
        type: String,
        observer: '_articlesChanged'
      },
      loaded: {
        type: Boolean,
        value: false
      }
    };
  }

  _articlesChanged(newValue, oldValue) {
    this.loaded = !!newValue;
  }

  isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  printJSON(obj) {
    if (!obj)
      return false;

    return JSON.stringify(obj);
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define('fetch-app', FetchApp);