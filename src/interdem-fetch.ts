import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators';
import {repeat} from "lit/directives/repeat";

import '@vaadin/vaadin-details';

import '@vaadin/vaadin-tabs';
import { TabsElement } from '@vaadin/vaadin-tabs';

import '@vaadin/vaadin-text-field';
import { TextFieldElement } from '@vaadin/vaadin-text-field';

import '@vaadin/vaadin-progress-bar';

import Fuse from 'fuse.js';
import * as JsSearch from 'js-search';
import {Author, AuthorData, Data, PubmedArticle} from "./types";

export interface Article {
  year: number;
  title: string;
  abstractText: string;
  journal: string;
  authorsString: string,
  authors: {LastName: string, Initials: string}[];
  PMID: string;
}

@customElement('interdem-fetch')
export class InterdemFetch extends LitElement {

  @property({type: Array}) authors?: AuthorData[];

  private _flatPapers?: any[];
  get flatPapers() : any[] {
    if (this._flatPapers)
      return this._flatPapers;

    this._flatPapers = [];

    this.authors?.forEach((author: any) => {
      if (this.isArray(author.data?.PubmedArticle)) {
        author.data?.PubmedArticle?.forEach((article: any) => {
          if (article) {
            let year: string | undefined = article?.MedlineCitation?.Article?.Journal?.JournalIssue?.PubDate?.Year;
            let title: string = article?.MedlineCitation?.Article?.ArticleTitle;
            let abstractText = this.getAbstractText(article?.MedlineCitation?.Article?.Abstract?.AbstractText);
            let journal: string | undefined = article?.MedlineCitation?.Article?.Journal?.Title;
            let authors: {LastName: string, Initials: string}[] | undefined = this.asArray(article?.MedlineCitation?.Article?.AuthorList?.Author);
            let PMID: string | undefined = article?.MedlineCitation?.PMID;

            let authorsString = authors.map((author: any) => `
              ${author?.FirstName} ${author?.LastName} ${author?.Initials}
            `).join(',');

            // filter to find possible duplicates
            const duplicates = this._flatPapers?.filter(item => item.PMID == PMID);

            if (year && title && abstractText && journal && authors && duplicates?.length == 0) {
              const category = this.classify(article, title, abstractText);

              if (category.show) {
                this._flatPapers?.push({
                  year: year,
                  title: title,
                  abstractText: abstractText,
                  journal: journal,
                  authors: authors,
                  authorsString: authorsString,
                  PMID: PMID
                });
              }
            }
          }
        });
      }
    });

    return this._flatPapers;
  }

  @property({type: Array}) papers: any[] = [
    {
      id: 0,
      show: true,
      name: 'Diagnosis and development of symptoms',
      keywords: [
        { name: 'diagnosis', weight: 10 },
        { name: 'diagnostic', weight: 10 },
        { name: 'prognosis', weight: 10 },
        { name: 'symptoms', weight: 10 },
        { name: 'validation', weight: 10 },
        { name: 'validate', weight: 10 }
      ]
    }, {
      id: 1,
      show: true,
      name: 'Health Economics',
      keywords: [
        { name: 'economic', weight: 100 },
        { name: 'costs', weight: 10 },
        { name: 'cost-effectiveness', weight: 100 }
      ]
    }, {
      id: 2,
      show: true,
      name: 'Organization of dementia care',
      keywords: [
        { name: 'organization', weight: 10 },
        { name: 'organisation', weight: 10 },
        { name: 'access to care', weight: 10 },
        { name: 'pathway', weight: 10 },
        { name: 'person centered care', weight: 10 },
        { name: 'person-centered care', weight: 10 },
        { name: 'person centred care', weight: 10 },
        { name: 'person-centred care', weight: 10 },
        { name: 'integrated care', weight: 10 }
      ]
    }, {
      id: 3,
      show: true,
      name: 'Persons need, quality of life and social/ethical issues',
      keywords: [
        { name: 'social', weight: 1 },
        { name: 'ethical', weight: 1 },
        { name: 'ethics', weight: 1 },
        { name: 'persons need', weight: 1 },
        { name: 'quality of life', weight: 1 },
        { name: 'decision-making', weight: 1 },
        { name: 'well-being', weight: 1 },
        { name: 'well being', weight: 1 },
        { name: 'psychological', weight: 1 },
        { name: 'psychological distress', weight: 1 },
        { name: 'physical', weight: 1 },
        { name: 'mobility', weight: 1 },
        { name: 'activities of daily living', weight: 1 },
        { name: 'instrumental activities of daily living', weight: 1 },
        { name: 'subjective need', weight: 1 },
        { name: 'iadl', weight: 1 },
      ]
    }, {
      id: 4,
      show: true,
      name: 'Psychosocial interventions for persons with dementia',
      keywords: [
        { name: 'intervention', weight: 1 },
        { name: 'persons with dementia', weight: 1 },
        { name: 'psychosocial', weight: 1 }
      ]
    }, {
      id: 5,
      show: true,
      name: 'Psychosocial interventions for caregivers',
      keywords: [
        { name: 'intervention', weight: 1 },
        { name: 'caregiver', weight: 1 },
        { name: 'physician', weight: 1 },
        { name: 'psychosocial', weight: 1 },
        { name: 'persons with dementia', weight: 1 },
        { name: 'nonpharmacological', weight: 1 },
        { name: 'non-pharmacological', weight: 1 }
      ]
    }, {
      id: 6,
      show: true,
      name: 'Advances in technology',
      keywords: [
        { name: 'technology', weight: 5 },
        { name: 'technological', weight: 5 },
        { name: 'assistive technology', weight: 5 },
        { name: 'e-health', weight: 10 },
        { name: 'wearables', weight: 10 },
        { name: 'devices', weight: 10 },
        { name: 'robots', weight: 10 },
        { name: 'robotics', weight: 10 },
        { name: 'telemedicine', weight: 10 },
        { name: 'artificial intelligence', weight: 10 },
        { name: 'machine learning', weight: 10 },
        { name: 'deep learning', weight: 10 },
        { name: 'ict', weight: 10 },
        { name: 'domotics', weight: 10 },
        { name: 'virtual reality', weight: 10 },
        { name: 'electronic', weight: 10 }
      ]
    }, {
      id: 7,
      show: false,
      name: 'Neuroscience',
      keywords: [
        { name: 'amyloid', weight: 100 },
        { name: 'pet', weight: 10 },
        { name: 'neurofilament', weight: 100 },
        { name: 'synaptic', weight: 10 },
        { name: 'apolipoprotein', weight: 100 },
        { name: 'butyrylcholinesterase', weight: 100 },
        { name: 'frontotemporal', weight: 10 },
        { name: 'vascular dementia', weight: 10 },
        { name: 'genetics', weight: 10 },
        { name: 'brain function', weight: 1 },
        { name: 'lewy bodies', weight: 10 },
        { name: 'exosomes', weight: 10 },
        { name: 'cerebrospinal', weight: 10 },
        { name: 'fluid', weight: 10 },
        { name: 'progranulin', weight: 10 },
        { name: 'ultrasound', weight: 10 },
        { name: 'drug use', weight: 1 },
        { name: 'drug', weight: 1 },
        { name: 'acetyltransferase', weight: 100 },
        { name: 'receptors', weight: 10 },
        { name: 'genotype', weight: 1 }
      ]
    }, {
      id: 8,
      show: true,
      name: 'Cognition',
      keywords: [
        { name: 'cognitive impairment', weight: 100 },
        { name: 'cognitive decline', weight: 100 },
        { name: 'neurocognitive impairment', weight: 100 }
      ]
    }
  ];

  private view: number | null | undefined = 0;

  private searchText?: string;

  private searchOutput?: any[] | null;

  private searchTimeout?: number | null;

  get totalArticles() : number {
    return this.authors?.length || 1;
  }

  private loadedArticles = 0;

  // language=CSS
  static styles = css`
    * {
      box-sizing: border-box;
      font-family: sans-serif;
    }

    .page-width {
      width: 95%;
      max-width: 1000px;
      margin: 0 auto;
    }

    a {
      text-decoration: none;
      color: cornflowerblue;
    }

    a:hover {
      opacity: 0.5;
    }
  `;

  render() : TemplateResult {
    return html`
      <div class="page-width">
        <h1>Articles</h1>

        ${this.loadedArticles < this.totalArticles ? html`
          <vaadin-progress-bar value="${this.loadedArticles / this.totalArticles}"></vaadin-progress-bar>
        ` : ''}

        <div style="display: flex; justify-content:space-between ">
          <vaadin-tabs theme="minimal" @selected-changed=${(e: CustomEvent) => {
            const tabs = e.target as TabsElement;
            this.view = tabs.selected;
            this.requestUpdate();
          }}>
            <vaadin-tab @click=${() => this.clearSearch}>By Topic</vaadin-tab>
            <vaadin-tab @click=${() => this.clearSearch}>By Author</vaadin-tab>
          </vaadin-tabs>
          <vaadin-text-field clear-button-visible placeholder="Search" @change=${this.searchChanged} @input=${this.searchChanged}></vaadin-text-field>
        </div>

        ${this.searchTimeout && this.searchText ? html`
          <p style="text-align: center">
            Searching...
          </p>
        ` : ''}

        ${this.searchOutput && !this.searchTimeout ? this.searchOutput?.sort((a: Article, b: Article) => b.year - a.year).map((article: Article) => html`
          <p>
            <b>${article.year}</b>
            ${article.authors?.map(author => html`
              ${author?.LastName} ${author?.Initials},
            `)}
            <a href="https://pubmed.ncbi.nlm.nih.gov/${article.PMID}/">
              ${article.title}
            </a>
            ${article.journal}
          </p>
        `) : ''}
        ${this.searchOutput && this.searchOutput.length == 0 ? html`
          <p style="text-align: center">
            No Results
          </p>
        ` : ''}

        <div style="display: ${(this.view == 1 && !this.searchText) ? 'block' : 'none'}">
          ${this.authors?.map((mainAuthor: AuthorData) => html`
            ${mainAuthor?.data?.PubmedArticle && this.isArray(mainAuthor?.data?.PubmedArticle) ? html`
              <vaadin-details>
                <div slot="summary">${mainAuthor.name}</div>
                ${mainAuthor?.data?.PubmedArticle ? mainAuthor?.data?.PubmedArticle?.map(article => html`
                  <p>
                    <b>${article.MedlineCitation?.Article?.Journal?.JournalIssue?.PubDate?.Year}</b>
                    ${article?.MedlineCitation?.Article?.AuthorList?.Author ? repeat(this.asArray(article.MedlineCitation.Article.AuthorList.Author), (author: any) => html`
                      ${author?.LastName} ${author?.Initials},
                    `) : ''}
                    <a href="https://pubmed.ncbi.nlm.nih.gov/${article.MedlineCitation?.PMID}/">
                      ${article?.MedlineCitation?.Article?.ArticleTitle}
                    </a>
                    ${article?.MedlineCitation?.Article?.Journal?.Title}
                  </p>
                `) : ''}
              </vaadin-details>
            ` : ''}
          `)}
        </div>

        <div style="display: ${(this.view == 0 && !this.searchText) ? 'block' : 'none'}">
          ${this.papers?.map(category => category.show ? html`
            <h2>${category.name}</h2>
            ${category?.years ? repeat(category.years, (yearGroup: any) => html`
              <vaadin-details>
                <div slot="summary">${yearGroup.year}</div>
                ${yearGroup?.articles ? repeat(yearGroup.articles, (article: any) => html`
                <p>
                  ${article?.MedlineCitation?.Article?.AuthorList?.Author ? repeat(this.asArray(article.MedlineCitation.Article.AuthorList.Author), (author: any) => html`
                    ${author?.LastName} ${author?.Initials},
                  `) : ''}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/${article.MedlineCitation?.PMID}/">
                    ${article?.MedlineCitation?.Article?.ArticleTitle}
                  </a>
                  ${article?.MedlineCitation?.Article?.Journal?.Title}
                </p>
              `) : ''}
              </vaadin-details>
            `) : ''}
          ` : '')}
        </div>
        <br/>
        <br/>
      </div>
    `;
  }

  connectedCallback() : void {
    super.connectedCallback();

    if (this.isLocal()) {
      fetch('/data/names.json').then(res => res.json()).then((list: AuthorData[]) => {
        this.authors = list;
        this.fetchAuthorData(list[0], '/testData/aguirre+elisa.json');
      });
    } else {
      fetch('/data/names.json').then(res => res.json()).then((list: AuthorData[]) => {
        this.authors = list;

        list.forEach(async (author: AuthorData) => {
          const url = '/backend/fetch.php?author=' + encodeURIComponent(author.name);
          await this.fetchAuthorData(author, url);
          console.log("Waiting avoid double requests");
          await new Promise(r => setTimeout(r, 100));
          console.log("Waiting avoid double requests");
        })
      });
    }
  }

  async fetchAuthorData(author: AuthorData, url: string, retry = true) : Promise<void> {
    return await fetch(url).then(res => {
      if (!res.ok)
        throw new Error("Could not fetch author");

      return res.json();
    }).then((data: Data) => {
      author.data = data;
      this.addAuthorData(author, url);
      this._flatPapers = undefined;
    }).catch(() => {
      console.log(author.name + ' is not available (' + url + ')');
    });
  }

  addAuthorData(author: AuthorData, url: string, retry = true) : void {
    if (author.data && author.data['PubmedArticle'] && Array.isArray(author.data['PubmedArticle'])) {
      author.data['PubmedArticle'].forEach(paper => {
        if (paper['MedlineCitation'] && paper['MedlineCitation']['Article']) {
          let year = paper['MedlineCitation']['Article']['Journal']['JournalIssue']['PubDate']['Year'];
          if (year == null || year == '')
            year = paper['MedlineCitation']['DateCompleted']['Year'];
          if (year == null || year == '')
            return; // the year is not known, don't view this one

          const title = paper['MedlineCitation']['Article']['ArticleTitle'];
          let paperAbstract = '';

          if (paper['MedlineCitation']['Article']['Abstract'] &&
            paper['MedlineCitation']['Article']['Abstract']['AbstractText']) {
            paperAbstract = this.getAbstractText(paper['MedlineCitation']['Article']['Abstract']['AbstractText']);
          }

          // calculate best category
          const category = this.classify(paper, title, paperAbstract);

          // get category id
          const categoryIdx = this.papers?.indexOf(category);

          if (!category['years'])
            category['years'] = [];

          if (category['years'].filter((x: { [x: string]: any; }) => x['year'] == year).length == 0) {
            const yearTmp: any = {};

            yearTmp['year'] = year;
            yearTmp['titles'] = [];
            yearTmp['articles'] = [];

            category['years'].push(yearTmp);

            category['years'] = category['years'].sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
          }

          // select the correct year
          let categoryYear: any = null;
          category['years'].forEach((x: { [x: string]: any; }) => {
            if (x['year'] === year)
              categoryYear = x;
          });

          // add title, if it doesn't exist
          if (categoryYear && !categoryYear['titles']?.includes(title)) {
            categoryYear['titles'].push(title);

            paper['abstract'] = paperAbstract;
            categoryYear['articles'].push(paper);
          }
        }
      });

      this.papers = this.papers?.sort((a: any, b: any) => {
        return a.id - b.id;
      });

      this.requestUpdate();
    } else {
      // if (retry)
      //   this.fetchAuthorData(author, url,false);
      console.warn('warning no data');
    }

    this.loadedArticles++;
  }

  getAbstractText(obj: any | any[]) : string {
    if (this.isObject(obj)) {
      if (this.isArray(obj)) {
        let res = '';

        obj.forEach((item: string) => res += item);

        return res;
      } else {
        let res = '';

        const tmp = Object.entries(obj);
        tmp.forEach((item: any) => res += item.value);

        return res;
      }
    } else {
      if (typeof  obj !== 'string') {
        return '';
      }

      return obj;
    }
  }

  classify(paper: PubmedArticle, title: string, paperAbstract: string) : { id: number, show: boolean, name: string, keywords: { name: string, weight: number }[], years: any[] } {
    const text = (title + ' ' + paperAbstract).toLowerCase();

    return this.papers?.sort((a, b) => {
      const aMatches = this.countKeywords(text, a['keywords']);
      const bMatches = this.countKeywords(text, b['keywords']);

      return bMatches - aMatches;
    })[0];
  }

  countKeywords(text: string, keywords: any[]) : number {
    let numMatches = 0;

    keywords.forEach((x: { name: string, weight: number}) => {
      const regex = new RegExp(x.name.toLowerCase(), 'g');
      const matches = text.match(regex);
      if (matches)
        numMatches += matches.length * x.weight;
    });

    return numMatches;
  }

  isObject(obj: any | any[]) : boolean {
    return typeof obj === 'object' && obj !== null;
  }

  isArray(obj: any | any[]) : boolean {
    return Array.isArray(obj);
  }

  asArray(obj: any | any[]) : any[] {
    if (Array.isArray(obj))
      return obj;
    else
      return [ obj ];
  }

  async searchChanged(e: CustomEvent) : Promise<void> {
    const search = e.target as TextFieldElement;

    this.searchText = search.value;

    if (this.searchTimeout)
      clearTimeout(this.searchTimeout);

    this.searchTimeout = window.setTimeout(() => {

      if (this.authors && search.value.length > 0 && search.value != ' ') {
        // const options = {
        //   includeScore: true,
        //   threshold: 0.4,
        //   keys: [
        //     'year',
        //     'title',
        //     'abstractText',
        //     "authorsString",
        //   ]
        // }
        //
        // const papers = this.flatPapers;
        //
        // const fuse = new Fuse(papers, options);
        // this.searchOutput = fuse.search(search.value);

        let r = Math.random().toString(36).substring(7);
        let date = new Date();
        console.log("search created: " + r);

        let jsSearch = new JsSearch.Search('title');
        jsSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
        jsSearch.addIndex('title');
        jsSearch.addIndex('year');
        jsSearch.addIndex('authorsString');
        jsSearch.addDocuments(this.flatPapers);

        Promise.resolve().then(() => {
          this.searchOutput = jsSearch.search(search.value);
          let time = new Date().getTime() - date.getTime();
          console.log("search finished: " + r + " in " + time + "ms");

          this.requestUpdate();
        });

      } else {
        this.searchOutput = null;
      }

      this.searchTimeout = null;
    },250);

    this.requestUpdate();
  }

  clearSearch() : void {
    this.searchOutput = null;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    this.searchOutput = null;
  }

  isLocal() : boolean {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
  }
}
