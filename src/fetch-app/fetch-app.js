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
          
          <template is="dom-if" if="{{item.data}}">
            <template is="dom-if" if="{{item.data.PubmedArticle}}">
              <vaadin-details>
                <div slot="summary">
                  {{item.name}}
                </div>
                <template is="dom-repeat" items="[[item.data.PubmedArticle]]">
                  <vaadin-details theme="filled">
                    <div slot="summary">
                      {{item.MedlineCitation.Article.ArticleTitle}} 
                      ({{item.MedlineCitation.DateRevised.Year}})
                    </div>
                    <template is="dom-if" if="{{isObject(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                      <template is="dom-if" if="{{isArray(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                        <template is="dom-repeat" items="[[item.MedlineCitation.Article.Abstract.AbstractText]]">
                          <p>{{item}}</p>
                        </template>
                      </template>
                      <template is="dom-if" if="{{!isArray(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                        <template is="dom-repeat" items="[[asArray(item.MedlineCitation.Article.Abstract.AbstractText)]]">
                          <h3>{{item.key}}</h3>
                          <p>{{item.value}}</p>
                        </template>
                      </template>
                    </template>
                    <template is="dom-if" if="{{!isObject(item.MedlineCitation.Article.Abstract.AbstractText)}}">
                      <p>{{item.MedlineCitation.Article.Abstract.AbstractText}}</p>
                    </template>
                  </vaadin-details>
                </template>
              </vaadin-details>
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
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define('fetch-app', FetchApp);