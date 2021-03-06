import { Component, OnInit, NgZone } from '@angular/core';
import {I18nSelectPipe} from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';
import { Observable } from 'rxjs/Observable';
import {MatSnackBar} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {MatChipInputEvent} from '@angular/material';
import {ENTER} from '@angular/cdk/keycodes';


import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

enum ComponentState {IsEditing, IsCreating}
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // Data used to insert fill-in-the-blank questions

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  // Enter, comma
  separatorKeysCodes = [ENTER];


  // The game id of the current game, if there is one. This is actually the hash of the document
  gameID: string;
  gameForm: FormGroup;

  public ComponentState = ComponentState;
  public currentState: ComponentState = ComponentState.IsCreating;
  courseID: string;
  // The subcollection that lies in the previous document
  // gamesFB : AngularFirestoreCollection<any> = this.db.collection('courses').doc(this.courseID).collection('games');
  // currentGame in case there is a game that is being edited!
  currentGame: AngularFirestoreDocument<any>;

  constructor(private fb: FormBuilder,
              private db: AngularFirestore,
              public snackBar: MatSnackBar,
              private translationLoader: FuseTranslationLoaderService,
              private route: ActivatedRoute,
              private router: Router,
              private ngZone: NgZone) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  addQuestion(){
    (<FormArray>this.gameForm.get('questions')).push(this.fb.group({
          question: [null, Validators.required],
          answers : this.fb.array([
                this.fb.group({
                  answer: ['', Validators.required],
                  isCorrect: [false, Validators.required]
              })
          ]),
          type : 'multiple_choice'

        }));
  }

  addFillBlank()
  {

    (<FormArray>this.gameForm.get('questions')).push(this.fb.group({
      answers : this.fb.array([
      ]),
      type : 'fill_blank'

    }));

  }

  deleteQuestion(selectedQuestionIndex){
    const control = <FormArray>this.gameForm.get('questions');
    // remove the chosen row
    control.removeAt(selectedQuestionIndex);
  }

  onSubmit() {

    if (this.gameForm.valid){
      // The actions for onSubmit vary depending on what the user is doing
      if (this.currentState === ComponentState.IsCreating){
        const data = this.gameForm.value;
          this.db.collection('courses').doc(this.courseID).collection('games').add({
            name : data.name,
            description : data.description,
            isPublic : data.isPublic,
            questions : data.questions,
            rating: {
              negative : 0,
              positive: 0,
            },
            usersThatRated: {
      
            }
          });
          this.snackBar.open('¡Se ha creado el juego con éxito!', '', {
            duration: 2000,
            verticalPosition: 'top'
          });
      }
      else{
        const data = this.gameForm.value;
        this.db.collection('courses').doc(this.courseID).collection('games').doc(this.gameID).update({
          name : data.name,
          description : data.description,
          isPublic : data.isPublic,
          questions : data.questions,
        });
        this.snackBar.open('¡Se ha editado exitosamente el juego con éxito!', '', {
          duration: 2000,
          verticalPosition: 'top'
        });
      }
      this.resetForm();
    }
  }

  deleteAnswer(currentQuestionIndex, selectedAnswerIndex){
    var questionsArray : FormArray = <FormArray>this.gameForm.get('questions');
    var selectedQuestion : FormGroup = <FormGroup> questionsArray.controls[currentQuestionIndex];
    var answersArray = <FormArray> selectedQuestion.get('answers');
    answersArray.removeAt(selectedAnswerIndex);
  }

  addAnswer(selectedQuestionIndex){
    var questionsArray : FormArray = <FormArray>this.gameForm.get('questions');
    var selectedQuestion : FormGroup = <FormGroup> questionsArray.controls[selectedQuestionIndex];
    var answersArray = <FormArray> selectedQuestion.get('answers');
    answersArray.push(this.fb.group({
      answer: ['', Validators.required],
      isCorrect: [false, Validators.required]
    }));
  }

  addFillAnswer(event: MatChipInputEvent, index): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      
      const questionsArray: FormArray = <FormArray>this.gameForm.get('questions');
      const selectedQuestion: FormGroup = <FormGroup> questionsArray.controls[index];
      const answersArray = <FormArray> selectedQuestion.get('answers');
      answersArray.push(this.fb.group({
          name: value.trim(),
          isBlank: false,
          color: 'warn' 
      }));
    }

    if (input) {
      input.value = '';
    }

  }

  chipSelect(currentQuestionIndex, selectedAnswerIndex){
    let questionsArray : FormArray = <FormArray>this.gameForm.get('questions');
    let selectedQuestion : FormGroup = <FormGroup> questionsArray.controls[currentQuestionIndex];
    let answersArray = <FormArray> selectedQuestion.get('answers');
    let selectedAnswer : FormGroup = <FormGroup> answersArray.controls[selectedAnswerIndex];


    selectedAnswer.value.isBlank = !selectedAnswer.value.isBlank;

    console.log(selectedAnswer);
    
  }



  ngOnInit() {
      // The form is reset to empty values
      this.resetForm();
      // We get the game ID from the RESTFUL URL
      // Now we check if the current URL is a game edit. If so, set up everything
      if ((this.router.url).indexOf('game/edit') !== -1){
        this.currentState = ComponentState.IsEditing;
        this.route.params.subscribe(params => {
            this.gameID = params['game_id'];
            this.courseID = params['course_id'];
            this.currentGame = this.db.collection('courses').doc(this.courseID).collection('games').doc(this.gameID);
            const doc: Observable<any> = this.currentGame.valueChanges();
            doc.subscribe(data => {
              this.dataToForm(data);
            });
         });
      }
      // If it is not a game edit, we set up the course id
      else{
        this.route.params.subscribe(params => {
            this.courseID = params['course_id'];
         });
      }
  }

  OnInit(){

  }

  // This parses the data received from Firebase to a FormGroup
  dataToForm(data: any){
    this.gameForm.patchValue(data);
    // For each question, we create a form group with its controls and the answers FormArray
    

    data.questions.forEach(q => {


      if (q.type === 'multiple_choice'){

        (<FormArray>this.gameForm.get('questions')).push(this.fb.group({
          type : [q.type],
          question: [q.question, Validators.required],
          answers : this.fb.array([
          ])
        }));

      }else{

        (<FormArray>this.gameForm.get('questions')).push(this.fb.group({
          type : [q.type],
          answers : this.fb.array([
          ])
        }));

      }



    });

    // Now for each answer, we add it into the FormArray of answers
    // of each question previously created
    for (var i = 0; i < data.questions.length; i++){
      var q : any = data.questions[i];
      var questionGroup : FormGroup = <FormGroup>(<FormArray>this.gameForm.get('questions')).at(i);
      let answersArray : FormArray = (<FormArray>questionGroup.get('answers'));

      console.log(q);
      if (q.type === 'multiple_choice'){
        for (let j = 0; j < q.answers.length; j++){
          answersArray.push(this.fb.group({
            answer: [q.answers[j].answer, Validators.required],
            isCorrect: [q.answers[j].isCorrect, Validators.required],
          }));
        }
      }else{

        for (let j = 0; j < q.answers.length; j++){
          answersArray.push(this.fb.group({
            name: [q.answers[j].name],
            isBlank: [q.answers[j].isBlank],
            color : [q.answers[j].color]
          }));
        }

      }

    }
  }

  resetForm(){
    this.gameForm = this.fb.group({
        name: [null, Validators.required],
        description: [null, Validators.required],
        isPublic: [false, Validators.required],
        questions: this.fb.array([

        ])

    });
  }

}
