import {Component, Input} from '@angular/core';
import {AuthorModel} from "../../../models/author.model";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {DeleteAuthorDialogComponent} from "../delete-author-dialog/delete-author-dialog.component";

@Component({
  selector: 'app-author-card',
  templateUrl: './author-card.component.html',
  styleUrls: ['./author-card.component.scss']
})
export class AuthorCardComponent {


  constructor(private router : Router,
              public dialog: MatDialog) {
  }

  @Input() author!: AuthorModel;


  isImgValid():string{
    if (!(this.author.pictureURL)){
      return this.author.pictureURL = '../../../assets/unknown.png'
    }
    else return this.author.pictureURL
  }

  showAuthorSongs(authorName: string){
    this.router.navigate(
      ['/dashboard',authorName]
    )
  }

  deleteAuthor(author: AuthorModel){
    const dialogRef = this.dialog.open(DeleteAuthorDialogComponent, {
        width: '50vw',
        height: '20vh',
        disableClose: true,
        data: author
      }
    )
  }
}
