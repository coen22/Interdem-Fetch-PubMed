import {LitElement, html, css, property, customElement} from 'lit-element';
import {repeat} from "lit-html/directives/repeat";

import '@vaadin/vaadin-details';

@customElement('interdem-fetch')
export class InterdemFetch extends LitElement {

  @property({type: Array}) authors?: any[];

  @property({type: Array}) papers?: any[] = [
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

  render() {
    return html`
      <div class="page-width">
        <h1>Articles</h1>
        ${this.papers ? repeat(this.papers, category => category.show ? html`
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

        // slow down requests at a maximum of 3 per second to avoid PubMed blocking
        // await new Promise(r => setTimeout(r, Math.random() * list.length * 1000 / 3));

        await fetch(url).then(res => res.json()).then((data: any) => {
          author.data = data;
          this.addAuthorData(author);
          this.requestUpdate();
        }).catch(() => {
          console.log(author.name + ' is not available (' + url + ')');
        });
      })
    });
  }

  addAuthorData(author: any) {
    if (author.data && author.data['PubmedArticle'] && Array.isArray(author.data['PubmedArticle'])) {
      author.data['PubmedArticle'].forEach(paper => {
        if (paper['MedlineCitation'] && paper['MedlineCitation']['Article']) {
          let year = paper['MedlineCitation']['Article']['Journal']['JournalIssue']['PubDate']['Year'];
          if (year == null || year == '')
            year = paper['MedlineCitation']['DateCompleted']['Year'];
          if (year == null || year == '')
            return; // the year is not known, don't view this one

          let title = paper['MedlineCitation']['Article']['ArticleTitle'];
          let paperAbstract = '';

          if (paper['MedlineCitation']['Article']['Abstract'] &&
            paper['MedlineCitation']['Article']['Abstract']['AbstractText']) {
            paperAbstract = this.getAbstractText(paper['MedlineCitation']['Article']['Abstract']['AbstractText']);
          }

          let text = (title + ' ' + paperAbstract).toLowerCase();
          let category = this.papers?.sort((a, b) => {
            let aMatches = this.countKeywords(text, a['keywords']);
            let bMatches = this.countKeywords(text, b['keywords']);

            return bMatches - aMatches;
          })[0];
          let categoryIdx = this.papers?.indexOf(category);

          if (!category['years'])
            category['years'] = [];

          if (category['years'].filter((x: { [x: string]: any; }) => x['year'] == year).length == 0) {
            let yearTmp: any = {};

            yearTmp['year'] = year;
            yearTmp['titles'] = [];
            yearTmp['articles'] = [];

            category['years'].push(yearTmp);

            category['years'].sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => a['year'] < b['year']);
          }

          let categoryYear: any = null;
          category['years'].forEach((x: { [x: string]: any; }) => {
            if (x['year'] === year)
              categoryYear = x;
          });

          let categoryYearIdx = category['years'].indexOf(category);

          if (categoryYear && !categoryYear['titles']?.includes(title)) {
            categoryYear['titles'].push(title);

            paper['abstract'] = paperAbstract;
            categoryYear['articles'].push(paper);
          }
        }
      });
    } else {
      console.warn('warning no data');
    }

    this.papers?.sort((a: any, b: any) => {
      return a.id - b.id;
    });
  }

  getAbstractText(obj: any | any[]) {
    if (this.isObject(obj)) {
      if (this.isArray(obj)) {
        let res = '';

        obj.forEach((item: string) => res += item);

        return res;
      } else {
        let res = '';

        let tmp = Object.entries(obj);
        tmp.forEach((item: any) => res += item.value);

        return res;
      }
    } else {
      if (typeof  obj !== 'string')
        console.warn('The data type didn\'t match');

      return obj;
    }
  }

  countKeywords(text: string, keywords: any[]) {
    let numMatches = 0;

    keywords.forEach((x: { name: string, weight: number}) => {
      let regex = new RegExp(x.name.toLowerCase(), 'g');
      let matches = text.match(regex);
      if (matches)
        numMatches += matches.length * x.weight;
    });

    return numMatches;
  }

  isObject(obj: any | any[]) {
    return typeof obj === 'object' && obj !== null;
  }

  isArray(obj: any | any[]) {
    return Array.isArray(obj);
  }

  asArray(obj: any | any[]) {
    if (Array.isArray(obj))
      return obj;
    else
      return [ obj ];
  }
}
