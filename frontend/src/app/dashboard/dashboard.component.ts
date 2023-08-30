import {Component, OnInit} from '@angular/core';
import {SongModel} from "../models/song.model";
import {MatDialog} from "@angular/material/dialog";
import {CategoryModel} from "../models/category.model";
import {SharedService} from "../services/shared/shared.service";
import {AuthorModel} from "../models/author.model";
import {NewAuthorComponent} from "./authors/new-author/new-author.component";
import {AddDialogModel} from "../models/add-dialog.model";
import {FilterByComponent} from "./song/filter-by/filter-by.component";
import {SongService} from "./song/song.service";
import {AuthorService} from "./authors/author.service";
import {ActivatedRoute} from "@angular/router";
import {CategoryService} from "./categories/category.service";
import {NewSongComponent} from "./song/new-song/new-song.component";

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  categories!: CategoryModel[];
  artists!: AuthorModel[];
  songs: SongModel[]=[];
  songsTemp: SongModel[]=[];
  dialogData: AddDialogModel={category:[],author:[]};
  isLoggedIn!: boolean;
  authorID!: string;
  catID!: string;
  filteredSongs: SongModel[] = [];
  author: AuthorModel | undefined;

  constructor(public dialog: MatDialog,
              public sharedService: SharedService,
              private songService: SongService,
              private authorService: AuthorService,
              private route : ActivatedRoute,
              private categoryService: CategoryService) {
    this.sharedService.filterStatus=false;

    if (this.songs.length < 1){
      songService.getSongs().then(()=> {
        this.songs = this.sharedService.sharedSongsArray;
      });
      categoryService.getCategories().then(()=> {
        this.categories = this.categoryService.categories;
        this.dialogData.category = this.categoryService.categories;
      });
      authorService.getAuthors();
    }

    this.sharedService.isLoggedInStatus = this.isLoggedIn;
    this.isLoggedIn = !!sessionStorage.getItem("token");


  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      console.log(params, 'paramki');
      if (params.get('authorName')) {
        this.authorID = params.get('authorName') || '';
        if (this.authorID) {
          this.authorService.getAuthors().then(() => {
            this.songs = this.songs.filter(song =>
              song.authors.some(author => author.name === this.authorID)
            );
          });
        }
      } else {
        // this.filterByCategory();
      }
      console.log(this.songs)
    });
  }

  addArtist(){
    const dialogRef = this.dialog.open(NewAuthorComponent, {
      disableClose: true,
      width:'100vw',
      data: this.artists
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  addSong(){
    const dialogRef = this.dialog.open(NewSongComponent, {
      disableClose: true,
      width:'100vw',
      data: this.categoryService.dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result)
    });

  }

  openFilterByDialog() {
    const dialogRef = this.dialog.open(FilterByComponent, {
      disableClose: true,
      width:'50vw',
      data: this.songs
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
      this.songs=res;
      }
    })
  }
  removeFilters(){
    this.songs=this.songService.songsTemp;
    this.sharedService.filterStatus=false;
  }




}
