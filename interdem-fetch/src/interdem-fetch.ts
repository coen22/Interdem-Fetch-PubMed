import {LitElement, html, css, property, customElement, TemplateResult} from 'lit-element';
import {repeat} from "lit-html/directives/repeat";

import '@vaadin/vaadin-details';

import '@vaadin/vaadin-tabs';
import { TabsElement } from '@vaadin/vaadin-tabs';

import '@vaadin/vaadin-text-field';
import { TextFieldElement } from '@vaadin/vaadin-text-field';

import Fuse from 'fuse.js';
import {ifDefined} from "lit-html/directives/if-defined";

export interface Article {
  year: string;
  title: string;
  abstractText: string;
  journal: string;
  authorsString: string,
  authors: {LastName: string, Initials: string}[];
  PMID: string;
}

@customElement('interdem-fetch')
export class InterdemFetch extends LitElement {

  @property({type: Array}) authors?: any[];

  get flatPapers() : any[] {
    const papers: any = [];

    this.authors?.forEach((author: any) => {
      if (this.isArray(author.data?.PubmedArticle)) {
        author.data?.PubmedArticle?.forEach((article: any) => {
          if (article) {
            let year: string | undefined = article?.MedlineCitation?.Article?.Journal?.JournalIssue?.PubDate?.Year;
            let title: string | undefined = article?.MedlineCitation?.Article?.ArticleTitle;
            let abstractText = this.getAbstractText(article?.MedlineCitation?.Article?.Abstract?.AbstractText);
            let journal: string | undefined = article?.MedlineCitation?.Article?.Journal?.Title;
            let authors: {LastName: string, Initials: string}[] | undefined = article?.MedlineCitation?.Article?.AuthorList?.Author;
            let PMID: string | undefined = article?.MedlineCitation?.PMID;

            let authorsString = this.asArray(article.MedlineCitation.Article.AuthorList.Author).map((author: any) => `
              ${author?.LastName} ${author?.Initials}
            `).join(',');

            if (year && title && abstractText && journal && authors) {
              papers.push({
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
        });
      }
    });

    return papers;
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
        { name: 'costs', weight: 10 }
      ]
    }, {
      id: 2,
      show: true,
      name: 'Organization of dementia care',
      keywords: [
        { name: 'organization', weight: 10 },
        { name: 'organisation', weight: 10 }
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
        { name: 'end-of-life', weight: 1 }
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
        { name: 'psychosocial', weight: 1 }
      ]
    }, {
      id: 7,
      show: false,
      name: 'Neuroscience',
      keywords: [
        { name: 'Amyloid', weight: 100 },
        { name: 'PET', weight: 10 },
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
    }
  ];

  private view: number | null | undefined = 0;

  private searchOutput?: any[];

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

        <div style="display: flex; justify-content:space-between ">
          <vaadin-tabs theme="minimal" @selected-changed=${(e: CustomEvent) => {
            const tabs = e.target as TabsElement;
            this.view = tabs.selected;
            this.requestUpdate();
          }}>
            <vaadin-tab>By Topic</vaadin-tab>
            <vaadin-tab>By Author</vaadin-tab>
          </vaadin-tabs>
          <vaadin-text-field clear-button-visible placeholder="Search" @input=${this.searchChanged}></vaadin-text-field>
        </div>

        ${this.searchOutput ? this.searchOutput.map((article: { item: Article}) => html`
          <p>
            <b>${article.item.year}</b>
            ${article.item.authorsString},
            <a href="https://pubmed.ncbi.nlm.nih.gov/${article.item.PMID}/">
              ${article.item.title}
            </a>
            ${article.item.journal}
          </p>
        `) : ''}
        ${this.searchOutput && this.searchOutput.length == 0 ? html`No Results` : ''}

        ${this.view == 0 && !this.searchOutput ? this.papers?.map(category => category.show ? html`
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
        ` : '') : ''}
        <br/>
        <br/>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    fetch('/data/names.json').then(res => res.json()).then((list: { name: string }[]) => {
      this.authors = list;

      list.forEach(async (author: { name: string, data?: any }) => {
        const url = '/backend/fetch.php?author=' + encodeURIComponent(author.name);
        await this.fetchAuthorData(author, url);
      })
    });
  }

  async fetchAuthorData(author: any, url: string, retry = true) {
    return await fetch(url).then(res => {
      if (!res.ok)
        throw new Error("Could not fetch author");

      return res.json();
    }).then((data: any) => {
      author.data = data;
      this.addAuthorData(author, url);
    }).catch(() => {
      console.log(author.name + ' is not available (' + url + ')');
    });
  }

  addAuthorData(author: any, url: string, retry = true) {
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
          const text = (title + ' ' + paperAbstract).toLowerCase();
          const category = this.papers?.sort((a, b) => {
            const aMatches = this.countKeywords(text, a['keywords']);
            const bMatches = this.countKeywords(text, b['keywords']);

            return bMatches - aMatches;
          })[0];

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

  searchChanged(e: CustomEvent) : void {
    const search = e.target as TextFieldElement;

    if (this.authors && search.value.length > 0) {
      const options = {
        includeScore: true,
        threshold: 0.35,
        keys: [
          'year',
          'title',
          'abstractText',
          "authorsString",
          "journal"
        ]
      }

      const papers = this.flatPapers;

      const fuse = new Fuse(papers, options);
      this.searchOutput = fuse.search(search.value)
    } else {
      this.searchOutput = undefined;
    }

    this.requestUpdate();
  }
}
