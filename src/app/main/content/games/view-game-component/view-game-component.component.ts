import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';

import { GameData } from '../models/gameData';

@Component({
  selector: 'app-view-game-component',
  templateUrl: './view-game-component.component.html',
  styleUrls: ['./view-game-component.component.scss']
})

export class ViewGameComponentComponent implements OnInit {

  gameID: string;
  gameForm: FormGroup;

  gameCollection: AngularFirestoreCollection<GameData>;
  gameData: GameData;
  gameDoc: AngularFirestoreDocument<GameData>;

  // The current document we will be working on
  currentCourseFB: AngularFirestoreDocument<any> = this.db.collection('courses').doc('AROBb11WpOPFwPQu7xrT');
  // The subcollection that lies in the previous document
  gamesFB: AngularFirestoreCollection<any> = this.currentCourseFB.collection('games');


  constructor(private formBuilder: FormBuilder,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone ) {

  }

  ngOnInit() {
    // The form is reset to empty values
    this.resetForm();
    // We get the game ID from the RESTFUL URL
        this.route.params.subscribe(params => {
            this.gameID = params['game_id'];
            console.log(this.gameID);
            this.gameDoc = this.gamesFB.doc(this.gameID);
            const doc: Observable<GameData> = this.gameDoc.valueChanges();
            doc.subscribe(data => this.gameData = data);
            doc.subscribe(data => {
              this.dataToForm(data);
            });
         });
  }

  // This parses the data received from Firebase to a FormGroup
  dataToForm(data: any){
    this.gameForm.patchValue(data);
    // For each question, we create a form group with its controls and the answers FormArray
    data.questions.forEach(q => {
        (<FormArray>this.gameForm.get('questions')).push(this.formBuilder.group({
          question: [q.question, Validators.required],
          answers : this.formBuilder.array([
          ])
        }));
    });

    // Now for each answer, we add it into the FormArray of answers
    // of each question previously created
    for (var i = 0; i < data.questions.length; i++){
      var q: any = data.questions[i];
      var questionGroup: FormGroup = <FormGroup>(<FormArray>this.gameForm.get('questions')).at(i);
      var answersArray: FormArray = (<FormArray>questionGroup.get('answers'));
      for (var j = 0; j < q.answers.length; j++){
        answersArray.push(this.formBuilder.group({
        answer: [q.answers[j].answer, Validators.required],
        isCorrect: [q.answers[j].isCorrect, Validators.required]
        }));
      }
    }
  }

  resetForm(){
    this.gameForm = this.formBuilder.group({
        name: [null, Validators.required],
        description: [null, Validators.required],
        isPublic: [false, Validators.required],
        questions: this.formBuilder.array([

        ])

    });
  }


}