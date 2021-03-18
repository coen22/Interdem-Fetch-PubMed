export interface AuthorData {
  name: string;
  data?: Data;
}

export interface Data {
  PubmedArticle: PubmedArticle[];
}

export interface PubmedArticle {
  MedlineCitation: MedlineCitation;
  PubmedData:      PubmedData;
  abstract:        string;
}

export interface MedlineCitation {
  "@attributes":            MedlineCitationAttributes;
  PMID:                     string;
  DateCompleted:            DateCompleted;
  DateRevised:              DateCompleted;
  Article:                  Article;
  MedlineJournalInfo:       MedlineJournalInfo;
  CitationSubset:           CitationSubset;
  MeshHeadingList:          MeshHeadingList;
  KeywordList?:             KeywordList;
  CoiStatement?:            string;
  ChemicalList?:            ChemicalList;
  CommentsCorrectionsList?: CommentsCorrectionsList;
}

export interface MedlineCitationAttributes {
  Status:          Status;
  IndexingMethod?: string;
  Owner:           Owner;
}

export enum Owner {
  Nlm = "NLM",
}

export enum Status {
  Medline = "MEDLINE",
}

export interface Article {
  "@attributes":       ArticleAttributes;
  Journal:             Journal;
  ArticleTitle:        string;
  Pagination:          Pagination;
  ELocationID?:        string[] | string;
  Abstract:            Abstract;
  AuthorList:          AuthorList;
  Language:            Language;
  GrantList?:          GrantList;
  PublicationTypeList: PublicationTypeList;
  ArticleDate?:        DateCompleted;
  DataBankList?:       DataBankList;
}

export interface ArticleAttributes {
  PubModel: string;
}

export interface Abstract {
  AbstractText:          string[] | AbstractTextClass | string;
  CopyrightInformation?: string;
}

export interface AbstractTextClass {
  b:   string[];
  sup: string;
}

export interface DateCompleted {
  "@attributes"?: DateCompletedAttributes;
  Year:           string;
  Month?:         string;
  Day?:           string;
}

export interface DateCompletedAttributes {
  DateType: DateType;
}

export enum DateType {
  Electronic = "Electronic",
}

export interface AuthorList {
  "@attributes": AuthorListAttributes;
  Author:        Author[];
}

export interface AuthorListAttributes {
  CompleteYN: Yn;
}

export enum Yn {
  Y = "Y",
}

export interface Author {
  "@attributes":    AuthorAttributes;
  LastName:         string;
  ForeName:         string;
  Initials:         string;
  Identifier?:      string;
  AffiliationInfo?: AffiliationInfoElement[] | AffiliationInfoElement;
}

export interface AuthorAttributes {
  ValidYN: Yn;
}

export interface AffiliationInfoElement {
  Affiliation: string;
}

export interface DataBankList {
  "@attributes": AuthorListAttributes;
  DataBank:      DataBank;
}

export interface DataBank {
  DataBankName:        string;
  AccessionNumberList: AccessionNumberList;
}

export interface AccessionNumberList {
  AccessionNumber: string;
}

export interface GrantList {
  "@attributes": AuthorListAttributes;
  Grant:         Grant;
}

export interface Grant {
  GrantID:  string;
  Acronym?: string;
  Agency:   string;
  Country:  string;
}

export interface Journal {
  ISSN:            string;
  JournalIssue:    JournalIssue;
  Title:           string;
  ISOAbbreviation: string;
}

export interface JournalIssue {
  "@attributes": JournalIssueAttributes;
  Volume?:       string;
  Issue?:        string;
  PubDate:       DateCompleted;
}

export interface JournalIssueAttributes {
  CitedMedium: CitedMedium;
}

export enum CitedMedium {
  Internet = "Internet",
}

export enum Language {
  Eng = "eng",
}

export interface Pagination {
  MedlinePgn: string;
}

export interface PublicationTypeList {
  PublicationType: string[] | string;
}

export interface ChemicalList {
  Chemical: Chemical;
}

export interface Chemical {
  RegistryNumber:  string;
  NameOfSubstance: string;
}

export enum CitationSubset {
  IM = "IM",
}

export interface CommentsCorrectionsList {
  CommentsCorrections: CommentsCorrections;
}

export interface CommentsCorrections {
  "@attributes": CommentsCorrectionsAttributes;
  RefSource:     string;
  PMID:          string;
}

export interface CommentsCorrectionsAttributes {
  RefType: string;
}

export interface KeywordList {
  "@attributes": KeywordListAttributes;
  Keyword:       string[];
}

export interface KeywordListAttributes {
  Owner: string;
}

export interface MedlineJournalInfo {
  Country:     string;
  MedlineTA:   string;
  NlmUniqueID: string;
  ISSNLinking: string;
}

export interface MeshHeadingList {
  MeshHeading: MeshHeading[];
}

export interface MeshHeading {
  DescriptorName: string;
  QualifierName?: string[] | string;
}

export interface PubmedData {
  History:           History;
  PublicationStatus: PublicationStatus;
  ArticleIdList:     PubmedDataArticleIDList;
  ReferenceList?:    ReferenceList;
}

export interface PubmedDataArticleIDList {
  ArticleId: string[];
}

export interface History {
  PubMedPubDate: PubMedPubDate[];
}

export interface PubMedPubDate {
  "@attributes": PubMedPubDateAttributes;
  Year:          string;
  Month:         string;
  Day:           string;
  Hour?:         string;
  Minute?:       string;
}

export interface PubMedPubDateAttributes {
  PubStatus: PubStatus;
}

export enum PubStatus {
  Accepted = "accepted",
  Entrez = "entrez",
  Medline = "medline",
  Pubmed = "pubmed",
  Received = "received",
  Revised = "revised",
}

export enum PublicationStatus {
  Epublish = "epublish",
  Ppublish = "ppublish",
}

export interface ReferenceList {
  Title?:    string;
  Reference: Reference[];
}

export interface Reference {
  Citation:       string;
  ArticleIdList?: ReferenceArticleIDList;
}

export interface ReferenceArticleIDList {
  ArticleId: string;
}
